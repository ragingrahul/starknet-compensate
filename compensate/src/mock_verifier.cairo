

#[starknet::contract]
pub mod MockGroth16Verifier {
    use starknet::{
        get_caller_address,
        storage::{StoragePointerReadAccess, StoragePointerWriteAccess},
    };

    #[storage]
    struct Storage {
        /// When true, `verify_groth16_proof_bn254` returns true; false otherwise.
        should_verify: bool,
        /// Address allowed to flip `should_verify` (set to deployer in constructor).
        owner: starknet::ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: starknet::ContractAddress) {
        self.should_verify.write(true); // Default: proofs pass.
        self.owner.write(owner);
    }

    #[starknet::interface]
    pub trait IMockVerifier<TContractState> {
        fn set_should_verify(ref self: TContractState, value: bool);
        fn get_should_verify(self: @TContractState) -> bool;
    }

    #[abi(embed_v0)]
    impl MockVerifierAdmin of IMockVerifier<ContractState> {
        fn set_should_verify(ref self: ContractState, value: bool) {
            assert(get_caller_address() == self.owner.read(), 'Not owner');
            self.should_verify.write(value);
        }
        fn get_should_verify(self: @ContractState) -> bool {
            self.should_verify.read()
        }
    }

 
    #[abi(embed_v0)]
    impl MockGroth16VerifierImpl of super::super::interfaces::IGroth16Verifier<ContractState> {
        fn verify_groth16_proof_bn254(
            self: @ContractState, full_proof_with_hints: Span<felt252>,
        ) -> Result<Span<u256>, felt252> {
            if self.should_verify.read() {
                // Return empty public inputs for success
                Result::Ok(array![].span())
            } else {
                Result::Err('Mock verification failed')
            }
        }
    }
}
