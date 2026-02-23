import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
    try {
        const { slug, filename, contentType } = await req.json();

        if (!slug || !filename || !contentType) {
            console.error("Missing fields:", { slug, filename, contentType });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Basic validation for phase 1: avoid HEIC or unsupported heavy formats implicitly by 
        // expecting standard formats from the client.
        if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
            console.error("Unsupported file type:", contentType);
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        const key = `${slug}/original/${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
        });

        // Signed URL expires in 15 minutes
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        return NextResponse.json({ signedUrl, key });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}
