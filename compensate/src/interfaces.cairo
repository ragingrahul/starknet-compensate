use starknet::ContractAddress;

/// Minimal ERC20 interface — the methods needed by payroll contracts.
#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
    fn transfer(
        ref self: TContractState, recipient: ContractAddress, amount: u256,
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

/// Garaga-generated Groth16 verifier interface (BN254).
/// `full_proof_with_hints` is the flat felt252 array produced by
/// `garaga.starknet.groth16_contract_generator` / `garaga calldata`.
#[starknet::interface]
pub trait IGroth16Verifier<TContractState> {
    fn verify_groth16_proof_bn254(
        self: @TContractState, full_proof_with_hints: Span<felt252>,
    ) -> Result<Span<u256>, felt252>;
}
