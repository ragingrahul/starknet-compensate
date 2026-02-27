/// <reference lib="webworker" />

import type { Groth16Proof, PublicSignals } from "snarkjs";

export type ProverRequest = {
  circuitInputs: Record<string, string | string[]>;
  wasmPath: string;
  zkeyPath: string;
};

export type ProverResponse =
  | { type: "success"; proof: Groth16Proof; publicSignals: PublicSignals }
  | { type: "error"; message: string };

self.onmessage = async (e: MessageEvent<ProverRequest>) => {
  try {
    const snarkjs = await import("snarkjs");
    const { circuitInputs, wasmPath, zkeyPath } = e.data;

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      wasmPath,
      zkeyPath,
    );

    (self as unknown as Worker).postMessage({
      type: "success",
      proof,
      publicSignals,
    } satisfies ProverResponse);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Proof generation failed",
    } satisfies ProverResponse);
  }
};
