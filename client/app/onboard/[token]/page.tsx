"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptSecret } from "@/lib/crypto";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";

type OnboardState = "loading" | "reveal" | "confirmed" | "error" | "expired";

export default function OnboardPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<OnboardState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [secret, setSecret] = useState<string>("");
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAndDecrypt() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        if (res.status === 410) {
          setState("expired");
          const data = await res.json();
          setErrorMessage(data.error);
          return;
        }
        if (!res.ok) {
          setState("error");
          setErrorMessage("Invalid invite link");
          return;
        }

        const data = await res.json();
        setEmployeeName(data.employeeName || "");
        setCompanyName(data.companyName || "");

        const rawSecret = await decryptSecret(
          data.encryptedSecret,
          data.salt,
          token,
        );

        setSecret("0x" + rawSecret.toString(16));
        setState("reveal");
      } catch {
        setState("error");
        setErrorMessage(
          "Failed to decrypt your secret. The link may be invalid.",
        );
      }
    }

    fetchAndDecrypt();
  }, [token]);

  function handleCopy() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirm() {
    await fetch(`/api/invites/${token}`, { method: "POST" });
    setState("confirmed");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <Card className="w-full max-w-md shadow-xl border-purple-200/50">
        <CardContent className="p-8">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-purple-primary" />
              <p className="text-muted-foreground">Verifying your invite...</p>
            </div>
          )}

          {state === "reveal" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  Welcome{employeeName ? `, ${employeeName}` : ""}!
                </h2>
                {companyName && (
                  <p className="text-muted-foreground">
                    You&apos;ve been added to{" "}
                    <span className="font-medium text-foreground">
                      {companyName}
                    </span>{" "}
                    on Compensate.
                  </p>
                )}
              </div>

              <div className="w-full space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    Save this secret now. You will not be able to see it again.
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    You&apos;ll need this secret every time you claim your
                    payroll. Store it in a password manager or a secure
                    location.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Your Payroll Secret
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      type={showSecret ? "text" : "password"}
                      value={secret}
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSecret((v) => !v)}
                      className="shrink-0"
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600">
                      Copied to clipboard
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full bg-purple-primary hover:bg-purple-primary/90 text-white"
              >
                I&apos;ve saved my secret
              </Button>
            </div>
          )}

          {state === "confirmed" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
                <p className="text-muted-foreground">
                  Your account is ready. When it&apos;s time to claim payroll,
                  connect your Starknet wallet and enter your secret on the
                  claim page.
                </p>
              </div>
              <Button
                onClick={() => router.push("/claim")}
                className="w-full bg-purple-primary hover:bg-purple-primary/90 text-white"
              >
                Go to Claim Page
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="w-full text-muted-foreground"
              >
                Go to Home
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}

          {state === "expired" && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  Invite{" "}
                  {errorMessage?.includes("expired")
                    ? "Expired"
                    : "Already Used"}
                </h2>
                <p className="text-muted-foreground">
                  {errorMessage || "This invite link is no longer valid."}{" "}
                  Please ask your employer to send a new one.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
