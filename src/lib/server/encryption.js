import { decodeBase64 } from "@oslojs/encoding";
import { createCipheriv, createDecipheriv } from "crypto";
import { DynamicBuffer } from "@oslojs/binary";

const ENCRYPTION_KEY = 'ukthF54hvvbXRbUGEEpOoQ=='
const key = decodeBase64(ENCRYPTION_KEY);

export function encrypt(data) {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  const cipher = createCipheriv("aes-128-gcm", key, iv);
  const encrypted = new DynamicBuffer(0);
  encrypted.write(iv);
  encrypted.write(cipher.update(data));
  encrypted.write(cipher.final());
  encrypted.write(cipher.getAuthTag());
  return encrypted.bytes();
}

export function encryptString(data) {
  return encrypt(new TextEncoder().encode(data));
}

export function decrypt(encrypted) {
  if (encrypted.byteLength < 33) {
    throw new Error("Invalid data");
  }
  const decipher = createDecipheriv("aes-128-gcm", key, encrypted.slice(0, 16));
  decipher.setAuthTag(encrypted.slice(encrypted.byteLength - 16));
  const decrypted = new DynamicBuffer(0);
  decrypted.write(decipher.update(encrypted.slice(16, encrypted.byteLength - 16)));
  decrypted.write(decipher.final());
  return decrypted.bytes();
}

export function decryptToString(data) {
  return new TextDecoder().decode(decrypt(data));
}
