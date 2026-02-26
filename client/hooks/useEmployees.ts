import { useState, useEffect, useCallback } from "react";
import { Employee, EmployeeFormData } from "@/types/types";
import { useWallet } from "@/lib/wallet-context";
import {
  generateSecret,
  computeSecretHash,
  generateInviteToken,
  encryptSecret,
} from "@/lib/crypto";

export const useEmployees = () => {
  const { address } = useWallet();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/employees?wallet=${encodeURIComponent(address)}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.employees.map((e: any) => ({
          id: e.id,
          companyId: e.company_id,
          name: e.name,
          email: e.email,
          starknetWalletAddress: e.starknet_wallet_address,
          role: e.role,
          department: e.department,
          salary: e.salary,
          secretHash: e.secret_hash,
          leafNonceCounter: e.leaf_nonce_counter,
          status: e.status,
          createdAt: new Date(e.created_at),
          updatedAt: new Date(e.updated_at),
        })),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch employees";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const addEmployee = async (formData: EmployeeFormData) => {
    if (!address) return { success: false, error: "Wallet not connected" };

    setLoading(true);
    setError(null);

    try {
      const secret = generateSecret();
      const secretHash = computeSecretHash(secret);
      const inviteToken = generateInviteToken();
      const { encryptedSecret, salt } = await encryptSecret(
        secret,
        inviteToken,
      );

      // 1. Create the employee record
      const empResponse = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          name: formData.name,
          email: formData.email || undefined,
          starknetWalletAddress: formData.walletAddress,
          role: formData.role || undefined,
          department: formData.department || undefined,
          salary: Number(formData.salary),
          secretHash,
        }),
      });

      if (!empResponse.ok) {
        const errorData = await empResponse.json();
        throw new Error(errorData.error || "Failed to add employee");
      }

      const empData = await empResponse.json();

      // 2. Create the invite with the encrypted secret
      const inviteResponse = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          employeeId: empData.employee.id,
          inviteToken,
          encryptedSecret,
          salt,
        }),
      });

      if (!inviteResponse.ok) {
        const errorData = await inviteResponse.json();
        throw new Error(errorData.error || "Failed to create invite");
      }

      await fetchEmployees();

      const inviteUrl = `${window.location.origin}/onboard/${inviteToken}`;

      return {
        success: true,
        employee: empData.employee,
        inviteUrl,
        inviteToken,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add employee";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (
    employeeId: string,
    updates: {
      name?: string;
      email?: string | null;
      role?: string | null;
      department?: string | null;
      salary?: number;
    },
  ) => {
    if (!address) return { success: false, error: "Not connected" };

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, ...updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      await fetchEmployees();
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      return { success: false, error: msg };
    }
  };

  const deactivateEmployee = async (employeeId: string) => {
    if (!address) return { success: false, error: "Not connected" };

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, status: "inactive" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deactivate");
      }

      await fetchEmployees();
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Deactivate failed";
      return { success: false, error: msg };
    }
  };

  const reinviteEmployee = async (employeeId: string) => {
    if (!address) return { success: false, error: "Not connected" };

    try {
      // Generate a fresh secret + invite token + encryption
      const secret = generateSecret();
      const secretHash = computeSecretHash(secret);
      const inviteToken = generateInviteToken();
      const { encryptedSecret, salt } = await encryptSecret(
        secret,
        inviteToken,
      );

      // Update the employee's secret_hash (new secret replaces the old one)
      const updateRes = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, secretHash }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "Failed to update employee secret");
      }

      // Create a new invite row
      const inviteRes = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          employeeId,
          inviteToken,
          encryptedSecret,
          salt,
        }),
      });

      if (!inviteRes.ok) {
        const data = await inviteRes.json();
        throw new Error(data.error || "Failed to create invite");
      }

      const inviteUrl = `${window.location.origin}/onboard/${inviteToken}`;
      return { success: true, inviteUrl, inviteToken };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Re-invite failed";
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deactivateEmployee,
    reinviteEmployee,
  };
};
