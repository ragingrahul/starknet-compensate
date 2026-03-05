import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Garaga Calldata Service")

# Allow requests from your Next.js frontend
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# The VK lives next to this file in circuits/vk.json
VK_PATH = Path(__file__).parent / "circuits" / "vk.json"


class ProofRequest(BaseModel):
    proof: dict          # snarkjs Groth16Proof object
    publicSignals: list  # snarkjs publicSignals array (list of decimal strings)


def parse_garaga_output(raw: str) -> list[str]:
    """
    garaga calldata outputs one of these formats depending on version:
      - Space-separated:   0x1 0x2 0x3
      - Newline-separated: 0x1\n0x2\n0x3
      - Python list:       [0x1, 0x2, 0x3]
      - With a header:     "Calldata:\n0x1 0x2 ..."
    This handles all of them.
    """
    raw = raw.strip()

    # Strip a leading "Calldata:" header if present
    # NEW:
    if raw.lower().startswith("calldata"):
        if "\n" in raw:
            raw = raw.split("\n", 1)[1].strip()
        elif ":" in raw:
            # Header and data on the same line: "Calldata: 0x1 0x2 ..."
            raw = raw.split(":", 1)[1].strip()
        else:
            raw = ""

    # Strip surrounding brackets if it looks like a Python list
    if raw.startswith("[") and raw.endswith("]"):
        raw = raw[1:-1]

    # Split on commas, spaces, or newlines
    import re
    tokens = re.split(r"[\s,]+", raw)
    tokens = [t.strip() for t in tokens if t.strip()]

    result = []
    for t in tokens:
        if t.startswith("0x") or t.startswith("0X"):
            result.append(t)
        else:
            # Decimal integer — convert to hex
            try:
                result.append(hex(int(t)))
            except ValueError:
                pass  # skip garbage tokens

    return result


@app.post("/garaga-calldata")
async def generate_calldata(req: ProofRequest):
    if not VK_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"vk.json not found at {VK_PATH}. See README.",
        )

    with tempfile.TemporaryDirectory() as tmp:
        proof_path = os.path.join(tmp, "proof.json")
        pub_path = os.path.join(tmp, "public.json")

        with open(proof_path, "w") as f:
            json.dump(req.proof, f)
        with open(pub_path, "w") as f:
            json.dump(req.publicSignals, f)

        # Resolve garaga binary — prefer the one next to this process's Python
        garaga_bin = shutil.which("garaga") or str(
            Path(__file__).parent.parent / ".." / "venv" / "bin" / "garaga"
        )
        # Fall back to the known conda env location if not found
        conda_garaga = "/opt/anaconda3/envs/garaga/bin/garaga"
        if not os.path.exists(garaga_bin) and os.path.exists(conda_garaga):
            garaga_bin = conda_garaga

        result = subprocess.run(
            [
                garaga_bin, "calldata",
                "--system", "groth16",
                "--proof", proof_path,
                "--public-inputs", pub_path,
                "--vk", str(VK_PATH),
            ],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=tmp,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"garaga error: {result.stderr.strip() or 'unknown error'}",
            )

        output_file = os.path.join(tmp, "proof_calldata.txt")
        if not os.path.exists(output_file):
            raise HTTPException(
                status_code=500,
                detail=f"garaga did not produce output file. stdout: {result.stdout!r}",
            )

        with open(output_file) as f:
            calldata = [line.strip() for line in f if line.strip()]

        if not calldata:
            raise HTTPException(status_code=500, detail="garaga produced empty calldata file")

        return {"calldata": calldata}


@app.get("/health")
def health():
    return {"status": "ok", "vk_loaded": VK_PATH.exists()}