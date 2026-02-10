# ShieldedPool Contract

## Architecture

The ShieldedPool uses a two-level Merkle tree to provide privacy-preserving ZK payroll.

### L1 Tree (depth 16): Leaves → Company Root

- Built off-chain by each company for their own payroll period.
- `period_id` and `company_id` are **private** circuit inputs — never revealed on-chain.

### L2 Tree (depth 8): Company Roots → Global Root

- Built by the trusted coordinator (Compensate backend), batching roots from all companies into a single global Merkle tree.
- The `global_root` is the **only public root** — shared across all companies, so it reveals nothing about which company funded which leaf.

## Privacy Properties

- External observers cannot link a specific deposit to a specific withdrawal.
- Company identity is hidden from on-chain observers (only visible off-chain to the coordinator and the company's own employees).
- Employee wallet **is** revealed on withdrawal (by design — recipient is a public signal).

## Token Accounting

- Shared pool per token: all companies' deposits accumulate in the same contract balance.
- The coordinator ensures total deposits ≥ total committed amounts before updating the global root.
- No per-company balance tracking on-chain (that would correlate deposits to withdrawals).

## felt252 Overflow Handling

- `global_root` and `nullifier` are BN254 Poseidon outputs. They can exceed the Starknet felt252 field prime (`P_stark ≈ 3.6×10⁷⁵ < q_bn254 ≈ 2.2×10⁷⁶`).
- Both are stored as `u256`; storage map keys are derived via `poseidon(low, high)`.

## Flow

1. **Company** calls `deposit_funds(token, amount)` to fund the shared pool.
2. **Coordinator** calls `update_global_root(new_root)` after batching all company roots into the L2 tree.
3. **Employee** calls `withdraw(global_root, nullifier, amount, token, recipient, proof)` with a ZK proof of Merkle membership.

## Circuit Public Signals (ShieldedPayroll)

| Index | Signal        | Type | Notes                                        |
| ----- | ------------- | ---- | -------------------------------------------- |
| 0     | `global_root` | u256 | BN254 output — compared as u256              |
| 1     | `amount_low`  | u256 | Low 128 bits of amount; signal high = 0      |
| 2     | `amount_high` | u256 | High 128 bits of amount; signal high = 0     |
| 3     | `nullifier`   | u256 | BN254 Poseidon output — full u256 comparison |
| 4     | `recipient`   | u256 | Starknet address encoded as felt252 → u256   |

## Storage Key Derivation

Both `global_root` and `nullifier` are u256 values that may exceed felt252. Storage map keys are derived as:

```
key = poseidon(value.low as felt252, value.high as felt252)
```

This is safe because each 128-bit half fits within the Starknet field prime.
