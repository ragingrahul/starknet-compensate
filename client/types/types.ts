import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  starknetWalletAddress: z.string().min(1),
  role: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().positive(),
  secretHash: z.string().min(1),
});

export type Employee = {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  starknetWalletAddress: string;
  role: string | null;
  department: string | null;
  salary: number;
  secretHash: string;
  leafNonceCounter: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Company = {
  id: string;
  adminWalletAddress: string;
  name: string;
  payrollContractAddress: string | null;
  tokenContractAddress: string | null;
  verifierContractAddress: string | null;
  createdAt: Date;
};

export type PayrollPeriod = {
  id: string;
  companyId: string;
  periodId: string;
  label: string | null;
  merkleRoot: string;
  totalGross: string;
  state: "draft" | "funded" | "frozen" | "closed";
  commitTxHash: string | null;
  fundTxHash: string | null;
  freezeTxHash: string | null;
  closeTxHash: string | null;
  createdAt: Date;
};

export type PeriodLeaf = {
  id: string;
  periodId: string;
  employeeId: string;
  leafIndex: number;
  leafHash: string;
  amount: string;
  nonce: number;
  recipientCommitment: string;
  pathElements: string[];
  pathIndices: number[];
  claimed: boolean;
  claimTxHash: string | null;
  nullifierHash: string | null;
  createdAt: Date;
};

export type EmployeeInvite = {
  id: string;
  employeeId: string;
  companyId: string;
  inviteToken: string;
  encryptedSecret: string;
  salt: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
};

export type EmployeeFormData = {
  name: string;
  email: string;
  walletAddress: string;
  role: string;
  department: string;
  salary: number;
};
