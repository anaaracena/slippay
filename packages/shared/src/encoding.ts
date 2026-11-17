/**
 * Common byte encoding and decoding primitives shared across API, web, and listener.
 */

/**
 * Converts an ArrayBuffer or Uint8Array into a lowercase hex string.
 */
export function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const hex = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    hex[i] = bytes[i]!.toString(16).padStart(2, "0");
  }
  return hex.join("");
}

/**
 * Converts a hex string (optionally prefixed with '0x' or '0X') into a Uint8Array.
 * Throws an Error if the hex string has an odd length or contains invalid hex characters.
 */
export function hexToBuf(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("hex length must be even");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const a = clean.charCodeAt(i * 2);
    const b = clean.charCodeAt(i * 2 + 1);
    const aVal = getHexValue(a);
    const bVal = getHexValue(b);
    if (aVal < 0 || bVal < 0) {
      throw new Error(`invalid hex byte: ${clean.substring(i * 2, i * 2 + 2)}`);
    }
    out[i] = (aVal << 4) | bVal;
  }
  return out;
}

function getHexValue(charCode: number): number {
  if (charCode >= 48 && charCode <= 57) return charCode - 48; // '0'-'9'
  if (charCode >= 97 && charCode <= 102) return charCode - 97 + 10; // 'a'-'f'
  if (charCode >= 65 && charCode <= 70) return charCode - 65 + 10; // 'A'-'F'
  return -1;
}

/**
 * Alias for hexToBuf for backwards compatibility and parity with Stellar/Deno conventions.
 */
export const hexToUint8Array = hexToBuf;

/**
 * Encodes an ArrayBuffer or Uint8Array into an unpadded URL-safe base64 string (RFC 4648 §5).
 */
export function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const chars = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    chars[i] = String.fromCharCode(bytes[i]!);
  }
  return btoa(chars.join("")).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

/**
 * Decodes a URL-safe base64 string (padded or unpadded) into a Uint8Array.
 */
export function b64urlDecode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, "");
  const pad = clean.length % 4 === 0 ? "" : "=".repeat(4 - (clean.length % 4));
  const std = (clean + pad).replaceAll("-", "+").replaceAll("_", "/");
  const bin = atob(std);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)!;
  }
  return out;
}
