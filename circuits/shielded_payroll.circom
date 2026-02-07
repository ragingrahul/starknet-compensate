pragma circom 2.1.6;


include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/mux1.circom";


template MerklePathVerifier(DEPTH) {
    signal input  leaf;
    signal input  path_elements[DEPTH];
    signal input  path_indices[DEPTH];
    signal output root;

    component hashers[DEPTH];
    component muxL[DEPTH];
    component muxR[DEPTH];
    signal layer[DEPTH + 1];
    layer[0] <== leaf;

    for (var i = 0; i < DEPTH; i++) {
        muxL[i] = Mux1();
        muxL[i].c[0] <== layer[i];
        muxL[i].c[1] <== path_elements[i];
        muxL[i].s    <== path_indices[i];

        muxR[i] = Mux1();
        muxR[i].c[0] <== path_elements[i];
        muxR[i].c[1] <== layer[i];
        muxR[i].s    <== path_indices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== muxL[i].out;
        hashers[i].inputs[1] <== muxR[i].out;
        layer[i + 1] <== hashers[i].out;
    }

    root <== layer[DEPTH];
}

template ShieldedPayroll(DEPTH_L1, DEPTH_L2) {

    signal input s;                          // employee's raw secret
    signal input leaf_nonce;                 // per-leaf uniqueness nonce
    signal input path_L1[DEPTH_L1];         // L1 Merkle path elements
    signal input indices_L1[DEPTH_L1];      // L1 Merkle path indices (0=left, 1=right)
    signal input path_L2[DEPTH_L2];         // L2 Merkle path elements
    signal input indices_L2[DEPTH_L2];      // L2 Merkle path indices
    signal input period_id;                  // PRIVATE — hides which period/company
    signal input company_id;                 // PRIVATE — hides employer identity

    signal input global_root;               // L2 tree root — shared, hides company
    signal input amount_low;                // lower 128 bits of salary
    signal input amount_high;               // upper 128 bits of salary
    signal input nullifier;                 // unique spend tag (BN254 field — may > felt252)
    signal input recipient;                 // employee's Starknet wallet as a field element


    var DOMAIN_LEAF      = 0x504159524f4c4c5f4c454146;
    var DOMAIN_SECRET    = 0x504159524f4c4c5f534543524554;
    var DOMAIN_NULLIFIER = 0x534849454c4445445f4e554c4c494649455200;  // "SHIELDED_NULLIFIER\0"


    component secret_hasher = Poseidon(2);
    secret_hasher.inputs[0] <== DOMAIN_SECRET;
    secret_hasher.inputs[1] <== s;
    signal secret_hash <== secret_hasher.out;

    component leaf_hasher = Poseidon(8);
    leaf_hasher.inputs[0] <== DOMAIN_LEAF;
    leaf_hasher.inputs[1] <== secret_hash;
    leaf_hasher.inputs[2] <== amount_low;
    leaf_hasher.inputs[3] <== amount_high;
    leaf_hasher.inputs[4] <== period_id;
    leaf_hasher.inputs[5] <== company_id;
    leaf_hasher.inputs[6] <== leaf_nonce;
    leaf_hasher.inputs[7] <== recipient;
    signal leaf <== leaf_hasher.out;


    component merkle_L1 = MerklePathVerifier(DEPTH_L1);
    merkle_L1.leaf <== leaf;
    for (var i = 0; i < DEPTH_L1; i++) {
        merkle_L1.path_elements[i] <== path_L1[i];
        merkle_L1.path_indices[i]  <== indices_L1[i];
    }
    signal company_root <== merkle_L1.root;

    component merkle_L2 = MerklePathVerifier(DEPTH_L2);
    merkle_L2.leaf <== company_root;
    for (var i = 0; i < DEPTH_L2; i++) {
        merkle_L2.path_elements[i] <== path_L2[i];
        merkle_L2.path_indices[i]  <== indices_L2[i];
    }

    merkle_L2.root === global_root;

    component null_hasher = Poseidon(4);
    null_hasher.inputs[0] <== DOMAIN_NULLIFIER;
    null_hasher.inputs[1] <== s;
    null_hasher.inputs[2] <== period_id;
    null_hasher.inputs[3] <== company_id;
    signal computed_nullifier <== null_hasher.out;

    computed_nullifier === nullifier;
}


component main {
    public [global_root, amount_low, amount_high, nullifier, recipient]
} = ShieldedPayroll(16, 8);
