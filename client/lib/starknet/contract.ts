import type { StarknetWindowObject } from "@starknet-io/types-js";

/**
 * Split a bigint into its low and high 128-bit halves as hex strings,
 * matching the Cairo u256 { low: u128, high: u128 } calldata layout.
 */
export function toU256Calldata(value: bigint): [string, string] {
  const low = value & ((1n << 128n) - 1n);
  const high = value >> 128n;
  return ["0x" + low.toString(16), "0x" + high.toString(16)];
}

/**
 * Register a company on the ShieldedPool contract.
 * Must be called once by the company admin before any payroll operations.
 * The caller's wallet address becomes the on-chain company_id.
 */
export async function registerCompany(
  wallet: StarknetWindowObject,
  contractAddress: string,
  tokenAddress: string,
) {
  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: contractAddress,
          entry_point: "register_company",
          calldata: [tokenAddress],
        },
      ],
    },
  });
}

/**
 * Commit a payroll period's Merkle root on-chain.
 * root is treated as u256 since it may be a BN254 output that exceeds felt252.
 * Caller must be a registered company — their wallet IS the company_id.
 */
export async function commitPeriod(
  wallet: StarknetWindowObject,
  contractAddress: string,
  periodId: string,
  root: string,
  totalGross: bigint,
  metaHash: string = "0x0",
) {
  const [grossLow, grossHigh] = toU256Calldata(totalGross);
  const rootBig = BigInt(root);
  const [rootLow, rootHigh] = toU256Calldata(rootBig);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: contractAddress,
          entry_point: "commit_period",
          calldata: [
            periodId,
            rootLow,
            rootHigh,
            grossLow,
            grossHigh,
            metaHash,
          ],
        },
      ],
    },
  });
}

/**
 * Freeze a payroll period, preventing further modifications to the Merkle root.
 * Caller must be the registered company that owns this period.
 */
export async function freezePeriod(
  wallet: StarknetWindowObject,
  contractAddress: string,
  periodId: string,
) {
  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: contractAddress,
          entry_point: "freeze_period",
          calldata: [periodId],
        },
      ],
    },
  });
}

/**
 * Close a payroll period after all claims have been settled.
 * Caller must be the registered company that owns this period.
 */
export async function closePeriod(
  wallet: StarknetWindowObject,
  contractAddress: string,
  periodId: string,
) {
  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: contractAddress,
          entry_point: "close_period",
          calldata: [periodId],
        },
      ],
    },
  });
}

/**
 * Approve token spending and fund a period in one multicall.
 * companyId is the company admin's wallet address (the on-chain company identifier).
 */
export async function approveAndFund(
  wallet: StarknetWindowObject,
  tokenAddress: string,
  contractAddress: string,
  companyId: string,
  periodId: string,
  amount: bigint,
) {
  const [amtLow, amtHigh] = toU256Calldata(amount);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: tokenAddress,
          entry_point: "approve",
          calldata: [contractAddress, amtLow, amtHigh],
        },
        {
          contract_address: contractAddress,
          entry_point: "fund_period",
          // fund_period(company_id, period_id, amount)
          calldata: [companyId, periodId, amtLow, amtHigh],
        },
      ],
    },
  });
}

/**
 * Submit a ZK payroll claim against the ShieldedPool contract.
 * companyId   — the employer's wallet address (on-chain company_id).
 * nullifier   — Poseidon hash computed in the BN254 circuit (may exceed felt252; passed as u256).
 * Caller must equal recipient (enforced by the contract).
 */
export async function claim(
  wallet: StarknetWindowObject,
  contractAddress: string,
  companyId: string,
  periodId: string,
  amount: bigint,
  recipient: string,
  nullifier: bigint,
  fullProofWithHints: string[],
) {
  const [amtLow, amtHigh] = toU256Calldata(amount);
  const [nullLow, nullHigh] = toU256Calldata(nullifier);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: contractAddress,
          entry_point: "claim",
          calldata: [
            companyId,
            periodId,
            amtLow,
            amtHigh,
            recipient,
            nullLow,
            nullHigh,
            fullProofWithHints.length.toString(),
            ...fullProofWithHints,
          ],
        },
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// ShieldedPool contract functions
// ---------------------------------------------------------------------------

/**
 * Approve + deposit tokens into the shared shielded pool in one multicall.
 * Companies call this to fund employee salaries without per-company on-chain tracking.
 */
export async function approveAndDepositToPool(
  wallet: StarknetWindowObject,
  tokenAddress: string,
  poolContractAddress: string,
  amount: bigint,
) {
  const [amtLow, amtHigh] = toU256Calldata(amount);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: tokenAddress,
          entry_point: "approve",
          calldata: [poolContractAddress, amtLow, amtHigh],
        },
        {
          contract_address: poolContractAddress,
          entry_point: "deposit_funds",
          // deposit_funds(token: ContractAddress, amount: u256)
          calldata: [tokenAddress, amtLow, amtHigh],
        },
      ],
    },
  });
}

/**
 * Coordinator-only: update the global Merkle root on the ShieldedPool contract.
 * Called by the Compensate admin after aggregating all company roots into the L2 tree.
 */
export async function updateGlobalRoot(
  wallet: StarknetWindowObject,
  poolContractAddress: string,
  newRoot: bigint,
) {
  const [rootLow, rootHigh] = toU256Calldata(newRoot);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: poolContractAddress,
          entry_point: "update_global_root",
          calldata: [rootLow, rootHigh],
        },
      ],
    },
  });
}

/**
 * Submit a shielded ZK payroll withdrawal.
 * Proves membership in the global Merkle tree without revealing company or period.
 * globalRoot, nullifier — BN254 outputs, passed as u256 to avoid felt252 overflow.
 * Caller must equal recipient (enforced by the contract).
 */
export async function withdrawFromPool(
  wallet: StarknetWindowObject,
  poolContractAddress: string,
  globalRoot: bigint,
  nullifier: bigint,
  amount: bigint,
  tokenAddress: string,
  recipient: string,
  fullProofWithHints: string[],
) {
  const [rootLow, rootHigh] = toU256Calldata(globalRoot);
  const [nullLow, nullHigh] = toU256Calldata(nullifier);
  const [amtLow, amtHigh] = toU256Calldata(amount);

  return wallet.request({
    type: "wallet_addInvokeTransaction",
    params: {
      calls: [
        {
          contract_address: poolContractAddress,
          entry_point: "withdraw",
          calldata: [
            rootLow,
            rootHigh, // global_root: u256
            nullLow,
            nullHigh, // nullifier: u256
            amtLow,
            amtHigh, // amount: u256
            tokenAddress, // token: ContractAddress
            recipient, // recipient: ContractAddress
            fullProofWithHints.length.toString(),
            ...fullProofWithHints,
          ],
        },
      ],
    },
  });
}

const RPC_URL =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";

/**
 * Read the ERC-20 token balance of an account via direct JSON-RPC.
 * Returns 0n if the call fails or the result is empty.
 * Result is reconstructed from the u256 { low, high } return value.
 */
export async function readBalanceOf(
  tokenAddress: string,
  accountAddress: string,
): Promise<bigint> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_call",
      params: {
        request: {
          contract_address: tokenAddress,
          entry_point_selector: selectorFromName("balance_of"),
          calldata: [accountAddress],
        },
        block_id: "latest",
      },
    }),
  });

  const json = await res.json();

  if (json.error || !json.result || json.result.length === 0) {
    return 0n;
  }

  const low = BigInt(json.result[0]);
  const high = json.result[1] ? BigInt(json.result[1]) : 0n;
  return low + (high << 128n);
}

function selectorFromName(name: string): string {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(name);

  // starknet_keccak: keccak256(name) mod 2^250 (top 6 bits zeroed to fit felt252).
  // Hardcoding known selectors avoids a keccak256 dependency in the browser.
  // balance_of = 0x02e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e
  const KNOWN_SELECTORS: Record<string, string> = {
    balance_of:
      "0x02e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e",
    balanceOf:
      "0x02e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e",
    decimals:
      "0x004c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9",
    symbol:
      "0x0216b05c387bab9ac31918a3e61672f4618601f3c598a2f3f2710f37053e1ea4",
  };

  if (KNOWN_SELECTORS[name]) return KNOWN_SELECTORS[name];

  // No dynamic computation — add unknown selectors to KNOWN_SELECTORS above.
  void encoded;
  throw new Error(`Unknown selector: ${name}. Add it to KNOWN_SELECTORS.`);
}

/**
 * Read the decimal precision of an ERC-20 token via direct JSON-RPC.
 * Falls back to 18 if the call fails, which is the standard for most tokens.
 */
export async function readDecimals(tokenAddress: string): Promise<number> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_call",
      params: {
        request: {
          contract_address: tokenAddress,
          entry_point_selector: selectorFromName("decimals"),
          calldata: [],
        },
        block_id: "latest",
      },
    }),
  });

  const json = await res.json();
  if (json.error || !json.result || json.result.length === 0) return 18;
  return Number(BigInt(json.result[0]));
}
