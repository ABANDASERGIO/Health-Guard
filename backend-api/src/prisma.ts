import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "..", ".env"),
  path.resolve(__dirname, "..", "..", ".env"),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

// Single PrismaClient instance to avoid connection pool / init race issues
// when multiple controllers instantiate their own PrismaClient.
export const prisma = new PrismaClient();

