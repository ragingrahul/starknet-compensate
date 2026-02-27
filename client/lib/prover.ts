import { poseidon2 } from "poseidon-lite/poseidon2";
import { poseidon4 } from "poseidon-lite/poseidon4";
import { poseidon8 } from "poseidon-lite/poseidon8";
import type { ProverResponse } from "./prover-worker";

// Domain separators — must match shielded_payroll.circom exactly
const DOMAIN_SECRET = BigInt("0x504159524f4c4c5f534543524554");
const DOMAIN_LEAF = BigInt("0x504159524f4c4c5f4c454146");
// "SHIELDED_NULLIFIER\0" — different from old circuit to prevent cross-circuit collisions
const DOMAIN_NULLIFIER = BigInt("0x534849454c4445445f4e554c4c494649455200");

// ---------------------------------------------------------------------------
// Shielded circuit helpers
// ---------------------------------------------------------------------------

/**
 * Compute the nullifier for the shielded circuit.
 * nullifier = poseidon4(DOMAIN_NULLIFIER, secret, period_id, company_id)
 *
 * NOTE: This is a BN254 Poseidon output — it can exceed the Starknet felt252
 * field prime.  The contract stores it as u256.
 */
export function computeShieldedNullifier(
  secret: bigint,
  periodId: bigint,
  companyId: bigint,
): bigint {
  return poseidon4([DOMAIN_NULLIFIER, secret, periodId, companyId]);
}

/**
 * Compute a leaf commitment for the shielded circuit.
 * leaf = poseidon8(DOMAIN_LEAF, secret_hash, amount_low, amount_high,
 *                 period_id, company_id, leaf_nonce, recipient)
 * Must match the leaf_hasher in shielded_payroll.circom exactly.
 */
export function computeShieldedLeaf(params: {
  secretHash: bigint;
  amountLow: bigint;
  amountHigh: bigint;
  periodId: bigint;
  companyId: bigint;
  leafNonce: bigint;
  recipient: bigint;
}): bigint {
  return poseidon8([
    DOMAIN_LEAF,
    params.secretHash,
    params.amountLow,
    params.amountHigh,
    params.periodId,
    params.companyId,
    params.leafNonce,
    params.recipient,
  ]);
}

/** Derive the secret_hash from the raw secret. */
export function computeSecretHash(secret: bigint): bigint {
  return poseidon2([DOMAIN_SECRET, secret]);
}

// ---------------------------------------------------------------------------
// Legacy helpers kept for SharedPayroll backward compatibility
// ---------------------------------------------------------------------------

export function computeNullifier(
  periodId: string,
  secret: bigint,
  leafNonce: number,
): bigint {
  return poseidon4([
    BigInt("0x504159524f4c4c5f4e554c4c494649455200"),
    BigInt(periodId),
    secret,
    BigInt(leafNonce),
  ]);
}

export function computeRecipientCommitment(recipient: string): bigint {
  return poseidon2([
    BigInt("0x504159524f4c4c5f524543495049454e54"),
    BigInt(recipient),
  ]);
}

// ---------------------------------------------------------------------------
// Web worker wrapper
// ---------------------------------------------------------------------------

function proveInWorker(
  circuitInputs: Record<string, string | string[]>,
  wasmPath: string,
  zkeyPath: string,
): Promise<{ proof: unknown; publicSignals: string[] }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./prover-worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e: MessageEvent<ProverResponse>) => {
      worker.terminate();
      if (e.data.type === "success") {
        resolve({ proof: e.data.proof, publicSignals: e.data.publicSignals });
      } else {
        reject(new Error(e.data.message));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(new Error(err.message || "Worker error"));
    };

    worker.postMessage({ circuitInputs, wasmPath, zkeyPath });
  });
}

// ---------------------------------------------------------------------------
// Shielded proof generation
// ---------------------------------------------------------------------------

export async function generateShieldedClaimProof(params: {
  secret: bigint;
  leafNonce: number;
  // L1 (leaf → company_root)
  pathL1: string[];
  indicesL1: number[];
  // L2 (company_root → global_root)
  pathL2: string[];
  indicesL2: number[];
  // Private
  periodId: bigint;
  companyId: bigint;
  // Public
  globalRoot: bigint;
  amount: bigint;
  recipientAddress: string;
}): Promise<{
  proof: unknown;
  publicSignals: string[];
  nullifier: bigint;
}> {
  const amountLow = params.amount & ((1n << 128n) - 1n);
  const amountHigh = params.amount >> 128n;
  const secretHash = computeSecretHash(params.secret);
  const recipient = BigInt(params.recipientAddress);

  const nullifier = computeShieldedNullifier(
    params.secret,
    params.periodId,
    params.companyId,
  );

  const circuitInputs = {
    // Private
    s: params.secret.toString(),
    leaf_nonce: params.leafNonce.toString(),
    path_L1: params.pathL1.map((e) => BigInt(e).toString()),
    indices_L1: params.indicesL1.map(String),
    path_L2: params.pathL2.map((e) => BigInt(e).toString()),
    indices_L2: params.indicesL2.map(String),
    period_id: params.periodId.toString(),
    company_id: params.companyId.toString(),
    // Public
    global_root: params.globalRoot.toString(),
    amount_low: amountLow.toString(),
    amount_high: amountHigh.toString(),
    nullifier: nullifier.toString(),
    recipient: recipient.toString(),
  };

  // Sanity check: verify the leaf matches what was built during period creation
  const expectedLeaf = computeShieldedLeaf({
    secretHash,
    amountLow,
    amountHigh,
    periodId: params.periodId,
    companyId: params.companyId,
    leafNonce: BigInt(params.leafNonce),
    recipient,
  });
  console.log("[prover] expected leaf hash:", "0x" + expectedLeaf.toString(16));
  console.log("[prover] nullifier:", "0x" + nullifier.toString(16));

  const { proof, publicSignals } = await proveInWorker(
    circuitInputs,
    "/circuits/shielded_payroll.wasm",
    "/circuits/shielded_payroll_final.zkey",
  );

  return { proof, publicSignals, nullifier };
}

// ---------------------------------------------------------------------------
// Legacy proof generation (SharedPayroll — kept for backward compatibility)
// ---------------------------------------------------------------------------

export async function generateClaimProof(params: {
  secret: bigint;
  leafNonce: number;
  pathElements: string[];
  pathIndices: number[];
  root: string;
  periodId: string;
  amount: bigint;
  recipientAddress: string;
}): Promise<{
  proof: unknown;
  publicSignals: string[];
  nullifier: bigint;
}> {
  const amountLow = params.amount & ((1n << 128n) - 1n);
  const amountHigh = params.amount >> 128n;
  const recipientCommitment = computeRecipientCommitment(
    params.recipientAddress,
  );
  const nullifier = computeNullifier(
    params.periodId,
    params.secret,
    params.leafNonce,
  );

  const circuitInputs = {
    s: params.secret.toString(),
    leaf_nonce: params.leafNonce.toString(),
    path_elements: params.pathElements.map((e) => BigInt(e).toString()),
    path_indices: params.pathIndices.map(String),
    root: BigInt(params.root).toString(),
    period_id: params.periodId,
    amount_low: amountLow.toString(),
    amount_high: amountHigh.toString(),
    recipient_commitment: recipientCommitment.toString(),
    nullifier: nullifier.toString(),
  };

  const { proof, publicSignals } = await proveInWorker(
    circuitInputs,
    "/circuits/payroll_claim.wasm",
    "/circuits/payroll_claim_final.zkey",
  );

  return { proof, publicSignals, nullifier };
}

export function encodeGaragaCalldata(
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] },
  publicSignals: string[],
): string[] {
  const toHex = (n: bigint) => "0x" + n.toString(16);
  return [
    toHex(BigInt(proof.pi_a[0])),
    toHex(BigInt(proof.pi_a[1])),
    toHex(BigInt(proof.pi_b[0][1])),
    toHex(BigInt(proof.pi_b[0][0])),
    toHex(BigInt(proof.pi_b[1][1])),
    toHex(BigInt(proof.pi_b[1][0])),
    toHex(BigInt(proof.pi_c[0])),
    toHex(BigInt(proof.pi_c[1])),
    toHex(BigInt(publicSignals.length)),
    ...publicSignals.map((s) => toHex(BigInt(s))),
  ];
}
