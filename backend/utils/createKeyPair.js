import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


function addToCurrentDir(fileName) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, fileName)
}

export {
  addToCurrentDir
}

function genKeyPair() {
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    }
  });

  fs.writeFileSync(addToCurrentDir("id_rsa_pub.pem"), keyPair.publicKey);
  fs.writeFileSync(addToCurrentDir("id_rsa_priv.pem"), keyPair.privateKey);
}

genKeyPair();