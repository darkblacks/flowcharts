import jwt, { type JwtHeader, type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

type FirebaseIdTokenPayload = JwtPayload & {
  aud: string;
  iss: string;
  sub: string;
  user_id?: string;
  email?: string;
  name?: string;
  auth_time?: number;
};

const FIREBASE_PUBLIC_KEYS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedPublicKeys: Record<string, string> | null = null;
let cacheExpiresAt = 0;

function getCacheMaxAgeMs(cacheControl: string | null): number {
  if (!cacheControl) return 60 * 60 * 1000;

  const match = cacheControl.match(/max-age=(\d+)/i);

  if (!match) return 60 * 60 * 1000;

  return Number(match[1]) * 1000;
}

async function getFirebasePublicKeys(): Promise<Record<string, string>> {
  const now = Date.now();

  if (cachedPublicKeys && now < cacheExpiresAt) {
    return cachedPublicKeys;
  }

  const response = await fetch(FIREBASE_PUBLIC_KEYS_URL);

  if (!response.ok) {
    throw new Error("Não foi possível buscar as chaves públicas do Firebase.");
  }

  const keys = (await response.json()) as Record<string, string>;

  cachedPublicKeys = keys;
  cacheExpiresAt =
    now + getCacheMaxAgeMs(response.headers.get("cache-control"));

  return keys;
}

function decodeHeader(idToken: string): JwtHeader {
  const decoded = jwt.decode(idToken, { complete: true });

  if (!decoded || typeof decoded === "string" || !("header" in decoded)) {
    throw new Error("Token malformado.");
  }

  return decoded.header;
}

function verifyWithPublicKey(
  idToken: string,
  publicKey: string
): FirebaseIdTokenPayload {
  const verified = jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    audience: env.FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
  });

  if (typeof verified === "string") {
    throw new Error("Payload do token inválido.");
  }

  const payload = verified as FirebaseIdTokenPayload;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!payload.sub || payload.sub.trim().length === 0) {
    throw new Error("Token sem sub válido.");
  }

  if (typeof payload.iat !== "number" || payload.iat > nowInSeconds) {
    throw new Error("Token com iat inválido.");
  }

  if (
    typeof payload.auth_time !== "undefined" &&
    (typeof payload.auth_time !== "number" || payload.auth_time > nowInSeconds)
  ) {
    throw new Error("Token com auth_time inválido.");
  }

  return payload;
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<FirebaseIdTokenPayload> {
  const header = decodeHeader(idToken);

  if (header.alg !== "RS256") {
    throw new Error("Algoritmo de token inválido.");
  }

  if (!header.kid || typeof header.kid !== "string") {
    throw new Error("Token sem kid válido.");
  }

  let publicKeys = await getFirebasePublicKeys();
  let publicKey = publicKeys[header.kid];

  if (!publicKey) {
    cacheExpiresAt = 0;
    publicKeys = await getFirebasePublicKeys();
    publicKey = publicKeys[header.kid];
  }

  if (!publicKey) {
    throw new Error("Chave pública do token não encontrada.");
  }

  return verifyWithPublicKey(idToken, publicKey);
}