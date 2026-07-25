import { generateKeyPairSync, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const secretsDirectory = join(process.cwd(), "backend", "secrets");
mkdirSync(secretsDirectory, { recursive: true });

const files = {
  db_username: "fitness_app",
  db_password: randomBytes(32).toString("base64url"),
};

const privateKeyPath = join(secretsDirectory, "jwt_private_key");
const publicKeyPath = join(secretsDirectory, "jwt_public_key");

if (!existsSync(privateKeyPath) || !existsSync(publicKeyPath)) {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
  });
  files.jwt_private_key = privateKey;
  files.jwt_public_key = publicKey;
}

for (const [name, value] of Object.entries(files)) {
  const path = join(secretsDirectory, name);
  if (!existsSync(path)) writeFileSync(path, value, { encoding: "utf8", mode: 0o600 });
}

console.log("Local Docker secrets are ready in backend/secrets/. They are gitignored.");
