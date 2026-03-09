# Compensate

**Privacy-preserving payroll on Starknet.**

Compensate allows companies to pay employees in crypto without revealing their entire payroll history or individual salaries to the public. By using Zero-Knowledge proofs (Groth16), we break the on-chain link between the employer's deposit and the employee's withdrawal.

## Why?

On public blockchains, every transaction is visible. For payroll, this is a dealbreaker:
- Competitors can see your burn rate and headcount.
- Employees can see each other's salaries.
- Bad actors can target high-earners.

Compensate solves this by mixing everyone's funds into a single **Shielded Pool**.

## How it works

1.  **Employer Setup**: Companies register and add employees in the web app. The app builds a Merkle tree of salaries off-chain.
2.  **Deposit**: The employer deposits the total payroll amount into the `ShieldedPool` contract.
3.  **Coordinator**: Our backend batches updates from multiple companies into a single "Global Root" on-chain. This increases the anonymity set—everyone hides in the crowd.
4.  **Withdrawal**: Employees receive a secret invite link via email. They use this secret to generate a ZK proof **in their browser**. This proof tells the contract: *"I am part of the payroll tree, and I haven't been paid yet,"* without revealing *who* they are or *which* company paid them.

## Tech Stack

-   **Smart Contracts**: Cairo v2 (Starknet)
-   **ZK Circuits**: Circom (Groth16 BN254)
-   **Verification**: Garaga (generates the Cairo verifier)
-   **Frontend**: Next.js 14, TypeScript, Tailwind, shadcn/ui
-   **Proving**: `snarkjs` running in a Web Worker (client-side privacy)
-   **Database**: Supabase (Postgres)
-   **Email**: Resend

## Getting Started

### Prerequisites
-   [Scarb](https://docs.swmansion.com/scarb/) (for Cairo contracts)
-   Node.js 18+
-   A Starknet wallet (Argent/Braavos)

### Installation

1.  **Smart Contracts**
    ```bash
    cd compensate
    scarb build
    # Run tests
    snforge test
    ```

2.  **Frontend**
    ```bash
    cd client
    npm install
    
    # Set up environment variables
    cp .env.example .env.local
    # (You'll need Supabase, Starknet RPC, and Resend keys)
    
    npm run dev
    ```

## Architecture

See [docs/shielded_pool.md](compensate/docs/shielded_pool.md) for a detailed breakdown of the ZK circuits and contract interactions.

---
Built for the Starknet Hackathon.
