"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Search,
  Copy,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployees } from "@/hooks/useEmployees";
import { Employee } from "@/types/types";

const formatSalary = (salary: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);

const formatWalletAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "active";
  const color =
    s === "active"
      ? "bg-green-100 text-green-800"
      : s === "inactive"
        ? "bg-gray-100 text-gray-800"
        : s === "on leave"
          ? "bg-yellow-100 text-yellow-800"
          : "";
  return <Badge className={`capitalize ${color}`}>{status}</Badge>;
}

// --- View Details Dialog ---

function ViewDetailsDialog({
  employee,
  open,
  onClose,
}: {
  employee: Employee;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showHash, setShowHash] = useState(false);

  function copyWallet() {
    navigator.clipboard.writeText(employee.starknetWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee.name}</DialogTitle>
          <DialogDescription>Employee details</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm py-4">
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{employee.email ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status</span>
            <div className="mt-0.5">
              <StatusBadge status={employee.status || "active"} />
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Role</span>
            <p className="font-medium">{employee.role ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Department</span>
            <p className="font-medium">{employee.department ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Salary</span>
            <p className="font-medium">{formatSalary(employee.salary)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Leaf Nonce</span>
            <p className="font-medium">{employee.leafNonceCounter}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Wallet Address</span>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-mono text-xs break-all">
                {employee.starknetWalletAddress}
              </p>
              <button onClick={copyWallet} className="shrink-0 text-muted-foreground hover:text-purple-primary">
                {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Secret Hash</span>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="font-mono text-xs break-all">
                {showHash
                  ? employee.secretHash
                  : `${employee.secretHash.slice(0, 10)}${"•".repeat(20)}`}
              </p>
              <button
                onClick={() => setShowHash((v) => !v)}
                className="shrink-0 text-muted-foreground hover:text-purple-primary"
              >
                {showHash ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p className="font-medium">{employee.createdAt.toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Updated</span>
            <p className="font-medium">{employee.updatedAt.toLocaleDateString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Dialog ---

function EditDialog({
  employee,
  open,
  onClose,
  onSave,
}: {
  employee: Employee;
  open: boolean;
  onClose: () => void;
  onSave: (updates: {
    name?: string;
    email?: string | null;
    role?: string | null;
    department?: string | null;
    salary?: number;
  }) => Promise<{ success: boolean; error?: string }>;
}) {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email ?? "");
  const [role, setRole] = useState(employee.role ?? "");
  const [department, setDepartment] = useState(employee.department ?? "");
  const [salary, setSalary] = useState(String(employee.salary));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    const result = await onSave({
      name,
      email: email || null,
      role: role || null,
      department: department || null,
      salary: Number(salary),
    });
    if (!result.success) {
      setError(result.error ?? "Failed to save");
    } else {
      onClose();
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update details for {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept">Department</Label>
              <Input
                id="edit-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-salary">Salary</Label>
            <Input
              id="edit-salary"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name}
            className="bg-purple-primary hover:bg-purple-primary/90 text-white"
          >
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Invite URL Dialog ---

function InviteUrlDialog({
  employee,
  inviteUrl,
  open,
  onClose,
}: {
  employee: Employee;
  inviteUrl: string;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Invite Created</DialogTitle>
          <DialogDescription>
            A new invite link has been generated for {employee.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              A new secret was generated. Any unclaimed payroll periods from
              before this re-invite will require the employee&apos;s previous
              secret.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Invite URL</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">Copied to clipboard</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Share this link with the employee. It expires in 48 hours.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-purple-primary hover:bg-purple-primary/90 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Table ---

export default function EmployeeTable() {
  const {
    employees,
    loading,
    updateEmployee,
    deactivateEmployee,
    reinviteEmployee,
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReinviteConfirm, setShowReinviteConfirm] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredEmployees = employees.filter((employee) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      employee.name?.toLowerCase().includes(s) ||
      (employee.email ?? "").toLowerCase().includes(s) ||
      (employee.role ?? "").toLowerCase().includes(s) ||
      (employee.department ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <>
      <div>
        <div className="p-4 border-b border-purple-border-secondary">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="w-full pl-8 bg-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-border-secondary">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Wallet</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Salary</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center">
                    <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-purple-border-secondary hover:bg-purple-bg-light/30"
                  >
                    <td className="p-4 align-middle font-medium">{employee.name}</td>
                    <td className="p-4 align-middle text-sm">{employee.email ?? "—"}</td>
                    <td className="p-4 align-middle font-mono text-xs">
                      {formatWalletAddress(employee.starknetWalletAddress)}
                    </td>
                    <td className="p-4 align-middle text-sm">{employee.role ?? "—"}</td>
                    <td className="p-4 align-middle text-sm">{employee.department ?? "—"}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={employee.status || "active"} />
                    </td>
                    <td className="p-4 align-middle">{formatSalary(employee.salary)}</td>
                    <td className="p-4 text-right align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-purple-bg-light/50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowDetail(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowEdit(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowReinviteConfirm(true);
                            }}
                          >
                            Re-invite
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={async () => {
                              setActionLoading(`deactivate-${employee.id}`);
                              await deactivateEmployee(employee.id);
                              setActionLoading(null);
                            }}
                            disabled={
                              employee.status === "inactive" ||
                              actionLoading === `deactivate-${employee.id}`
                            }
                          >
                            {employee.status === "inactive"
                              ? "Already Inactive"
                              : actionLoading === `deactivate-${employee.id}`
                                ? "Deactivating..."
                                : "Deactivate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Dialog */}
      {selectedEmployee && showDetail && (
        <ViewDetailsDialog
          employee={selectedEmployee}
          open={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Edit Dialog */}
      {selectedEmployee && showEdit && (
        <EditDialog
          employee={selectedEmployee}
          open={showEdit}
          onClose={() => {
            setShowEdit(false);
            setSelectedEmployee(null);
          }}
          onSave={(updates) => updateEmployee(selectedEmployee.id, updates)}
        />
      )}

      {/* Re-invite Confirmation Dialog */}
      {selectedEmployee && showReinviteConfirm && (
        <Dialog
          open={showReinviteConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setShowReinviteConfirm(false);
              setSelectedEmployee(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Re-invite {selectedEmployee.name}?</DialogTitle>
              <DialogDescription>
                This will generate a new secret for this employee.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">
                  This invalidates all unclaimed payroll leaves.
                </p>
                <p className="mt-1 text-red-700">
                  Any payroll periods already created with the old secret will no
                  longer be claimable by this employee. Only proceed if the
                  employee has no pending claims, or you plan to recreate
                  affected periods.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReinviteConfirm(false);
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={actionLoading === `reinvite-${selectedEmployee.id}`}
                onClick={async () => {
                  setActionLoading(`reinvite-${selectedEmployee.id}`);
                  const result = await reinviteEmployee(selectedEmployee.id);
                  if (result.success && result.inviteUrl) {
                    setInviteUrl(result.inviteUrl);
                  }
                  setActionLoading(null);
                  setShowReinviteConfirm(false);
                }}
              >
                {actionLoading === `reinvite-${selectedEmployee.id}`
                  ? "Creating..."
                  : "Confirm Re-invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite URL Dialog */}
      {selectedEmployee && inviteUrl && (
        <InviteUrlDialog
          employee={selectedEmployee}
          inviteUrl={inviteUrl}
          open={!!inviteUrl}
          onClose={() => {
            setInviteUrl(null);
            setSelectedEmployee(null);
          }}
        />
      )}
    </>
  );
}
