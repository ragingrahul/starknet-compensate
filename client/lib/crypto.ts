import { poseidon2 } from "poseidon-lite/poseidon2";

const DOMAIN_SECRET = BigInt("0x504159524f4c4c5f534543524554");

export function generateSecret(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  let s = BigInt(0);
  for (const b of bytes) {
    s = (s << BigInt(8)) | BigInt(b);
  }
  return s;
}

export function computeSecretHash(secret: bigint): string {
  const hash = poseidon2([DOMAIN_SECRET, secret]);
  return "0x" + hash.toString(16);
}

export function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(
  secret: bigint,
  inviteToken: string,
): Promise<{ encryptedSecret: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(inviteToken, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(secret.toString());

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );

  const payload = JSON.stringify({
    ct: uint8ToBase64(new Uint8Array(ciphertext)),
    iv: uint8ToHex(iv),
  });

  return {
    encryptedSecret: payload,
    salt: uint8ToHex(salt),
  };
}

export async function decryptSecret(
  encryptedSecret: string,
  salt: string,
  inviteToken: string,
): Promise<bigint> {
  const { ct, iv } = JSON.parse(encryptedSecret);
  const saltBytes = hexToUint8(salt);
  const ivBytes = hexToUint8(iv);
  const ciphertext = base64ToUint8(ct);
  const key = await deriveKey(inviteToken, saltBytes);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  const dec = new TextDecoder();
  return BigInt(dec.decode(plaintext));
}

function uint8ToHex(arr: Uint8Array): string {
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToUint8(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function uint8ToBase64(arr: Uint8Array): string {
  let binary = "";
  for (const b of arr) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
