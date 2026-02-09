#[starknet::contract]
mod MockERC20 {
    use starknet::{ContractAddress, get_caller_address, storage::{Map, StorageMapReadAccess, StorageMapWriteAccess}};
    use crate::interfaces::IERC20;

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, recipient: ContractAddress, amount: u256) {
        self.balances.write(recipient, amount);
    }

    #[abi(embed_v0)]
    impl ERC20Impl of IERC20<ContractState> {
        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let bal = self.balances.read(sender);
            assert(bal >= amount, 'Insufficient balance');
            self.balances.write(sender, bal - amount);
            let recv_bal = self.balances.read(recipient);
            self.balances.write(recipient, recv_bal + amount);
            true
        }

        fn transfer(
            ref self: ContractState, recipient: ContractAddress, amount: u256,
        ) -> bool {
            let caller = get_caller_address();
            let bal = self.balances.read(caller);
            assert(bal >= amount, 'Insufficient balance');
            self.balances.write(caller, bal - amount);
            let recv_bal = self.balances.read(recipient);
            self.balances.write(recipient, recv_bal + amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            // Mock: always approve — no allowance tracking needed for testing.
            true
        }
    }

    #[generate_trait]
    impl MockERC20Extras of MockERC20ExtrasTrait {
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress,
        ) -> u256 {
            0
        }
    }
}
