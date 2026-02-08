// See docs/shielded_pool.md for architecture and design rationale.

#[starknet::contract]
pub mod ShieldedPool {
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address,
        storage::{
            StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess,
            StorageMapWriteAccess, Map,
        },
    };
    use core::poseidon::poseidon_hash_span;
    use super::super::interfaces::{
        IERC20Dispatcher, IERC20DispatcherTrait, IGroth16VerifierDispatcher,
        IGroth16VerifierDispatcherTrait,
    };

    #[storage]
    struct Storage {
        verifier: ContractAddress,
        coordinator: ContractAddress,
        pool_balance: Map<ContractAddress, u256>,
        valid_global_roots: Map<felt252, bool>,
        nullifier_used: Map<felt252, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        FundsDeposited: FundsDeposited,
        GlobalRootUpdated: GlobalRootUpdated,
        Withdrawn: Withdrawn,
        CoordinatorChanged: CoordinatorChanged,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FundsDeposited {
        #[key]
        pub depositor: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct GlobalRootUpdated {
        pub new_root_low: u128,
        pub new_root_high: u128,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Withdrawn {
        pub recipient: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
        pub nullifier_low: u128,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CoordinatorChanged {
        pub old_coordinator: ContractAddress,
        pub new_coordinator: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verifier: ContractAddress,
        coordinator: ContractAddress,
    ) {
        let zero: ContractAddress = 0_felt252.try_into().unwrap();
        assert(verifier != zero, 'Verifier cannot be zero');
        assert(coordinator != zero, 'Coordinator cannot be zero');
        self.verifier.write(verifier);
        self.coordinator.write(coordinator);
    }

    #[starknet::interface]
    pub trait IShieldedPool<TContractState> {
        fn deposit_funds(
            ref self: TContractState, token: ContractAddress, amount: u256,
        );
        fn update_global_root(ref self: TContractState, new_root: u256);
        fn withdraw(
            ref self: TContractState,
            global_root: u256,
            nullifier: u256,
            amount: u256,
            token: ContractAddress,
            recipient: ContractAddress,
            full_proof_with_hints: Span<felt252>,
        );
        fn set_coordinator(ref self: TContractState, new_coordinator: ContractAddress);
        fn get_verifier(self: @TContractState) -> ContractAddress;
        fn get_coordinator(self: @TContractState) -> ContractAddress;
        fn get_pool_balance(self: @TContractState, token: ContractAddress) -> u256;
        fn is_valid_root(self: @TContractState, root: u256) -> bool;
        fn is_nullifier_used(self: @TContractState, nullifier: u256) -> bool;
    }

    #[abi(embed_v0)]
    impl ShieldedPoolImpl of IShieldedPool<ContractState> {

        fn deposit_funds(ref self: ContractState, token: ContractAddress, amount: u256) {
            let zero: ContractAddress = 0_felt252.try_into().unwrap();
            assert(token != zero, 'Token cannot be zero');
            assert(amount > 0_u256, 'Amount must be > 0');

            let caller = get_caller_address();
            let erc20 = IERC20Dispatcher { contract_address: token };
            let ok = erc20.transfer_from(caller, get_contract_address(), amount);
            assert(ok, 'ERC20 transfer_from failed');

            let current = self.pool_balance.read(token);
            self.pool_balance.write(token, current + amount);

            self.emit(FundsDeposited { depositor: caller, token, amount });
        }

        fn update_global_root(ref self: ContractState, new_root: u256) {
            let caller = get_caller_address();
            assert(caller == self.coordinator.read(), 'Not coordinator');
            assert(new_root != 0_u256, 'Root cannot be zero');

            let key = root_storage_key(new_root);
            assert(!self.valid_global_roots.read(key), 'Root already registered');

            self.valid_global_roots.write(key, true);

            self
                .emit(
                    GlobalRootUpdated {
                        new_root_low: new_root.low, new_root_high: new_root.high,
                    },
                );
        }

        fn withdraw(
            ref self: ContractState,
            global_root: u256,
            nullifier: u256,
            amount: u256,
            token: ContractAddress,
            recipient: ContractAddress,
            full_proof_with_hints: Span<felt252>,
        ) {
            let zero: ContractAddress = 0_felt252.try_into().unwrap();

            let caller = get_caller_address();
            assert(caller == recipient, 'Caller must be recipient');
            assert(recipient != zero, 'Recipient cannot be zero');

            let rk = root_storage_key(global_root);
            assert(self.valid_global_roots.read(rk), 'Invalid global root');

            let nk = nullifier_storage_key(nullifier);
            assert(!self.nullifier_used.read(nk), 'Nullifier already used');

            let balance = self.pool_balance.read(token);
            assert(balance >= amount, 'Insufficient pool balance');

            let verifier = IGroth16VerifierDispatcher {
                contract_address: self.verifier.read(),
            };
            let public_inputs = match verifier.verify_groth16_proof_bn254(full_proof_with_hints) {
                Result::Ok(pi) => pi,
                Result::Err(_) => panic!("Proof verification failed"),
            };

            assert(*public_inputs.at(0) == global_root, 'Proof root mismatch');
            assert(
                *public_inputs.at(1) == u256 { low: amount.low, high: 0_u128 },
                'Proof amount_low mismatch',
            );
            assert(
                *public_inputs.at(2) == u256 { low: amount.high, high: 0_u128 },
                'Proof amount_high mismatch',
            );
            assert(*public_inputs.at(3) == nullifier, 'Proof nullifier mismatch');

            let recipient_felt: felt252 = recipient.into();
            let recipient_u256: u256 = recipient_felt.into();
            assert(*public_inputs.at(4) == recipient_u256, 'Proof recipient mismatch');

            self.nullifier_used.write(nk, true);
            self.pool_balance.write(token, balance - amount);

            let erc20 = IERC20Dispatcher { contract_address: token };
            let ok = erc20.transfer(recipient, amount);
            assert(ok, 'ERC20 transfer failed');

            self
                .emit(
                    Withdrawn { recipient, token, amount, nullifier_low: nullifier.low },
                );
        }

        fn set_coordinator(ref self: ContractState, new_coordinator: ContractAddress) {
            let caller = get_caller_address();
            assert(caller == self.coordinator.read(), 'Not coordinator');
            let zero: ContractAddress = 0_felt252.try_into().unwrap();
            assert(new_coordinator != zero, 'Cannot be zero');

            let old = self.coordinator.read();
            self.coordinator.write(new_coordinator);
            self.emit(CoordinatorChanged { old_coordinator: old, new_coordinator });
        }

        fn get_verifier(self: @ContractState) -> ContractAddress {
            self.verifier.read()
        }
        fn get_coordinator(self: @ContractState) -> ContractAddress {
            self.coordinator.read()
        }
        fn get_pool_balance(self: @ContractState, token: ContractAddress) -> u256 {
            self.pool_balance.read(token)
        }
        fn is_valid_root(self: @ContractState, root: u256) -> bool {
            self.valid_global_roots.read(root_storage_key(root))
        }
        fn is_nullifier_used(self: @ContractState, nullifier: u256) -> bool {
            self.nullifier_used.read(nullifier_storage_key(nullifier))
        }
    }

    fn root_storage_key(root: u256) -> felt252 {
        let lo: felt252 = root.low.into();
        let hi: felt252 = root.high.into();
        poseidon_hash_span(array![lo, hi].span())
    }

    fn nullifier_storage_key(nullifier: u256) -> felt252 {
        let lo: felt252 = nullifier.low.into();
        let hi: felt252 = nullifier.high.into();
        poseidon_hash_span(array![lo, hi].span())
    }
}
