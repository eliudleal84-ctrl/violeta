import { S3Client } from "@aws-sdk/client-s3";

// Only warn during build time if missing, instead of strict throw which breaks next build
if (!process.env.R2_ACCOUNT_ID && process.env.NODE_ENV !== "production") {
    console.warn("Warning: R2_ACCOUNT_ID is not set in environment variables");
}

const r2AccountId = process.env.R2_ACCOUNT_ID || "dummy-account-id";
const endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;

export const s3Client = new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "dummy-key",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "dummy-secret",
    },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
