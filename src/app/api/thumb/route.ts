import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import sharp from "sharp";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");
        const widthStr = searchParams.get("w") || "400";
        const width = parseInt(widthStr, 10);

        if (!key) {
            return new NextResponse("Missing key", { status: 400 });
        }

        // Fetch original from R2
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
            return new NextResponse("Image not found", { status: 404 });
        }

        // AWS SDK v3 response.Body is a Node-like stream in Node.js environments.
        // We convert to buffer for sharp processing.
        const byteArray = await response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        // Process with sharp: Resize and convert to WebP
        const optimizedBuffer = await sharp(buffer)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        return new NextResponse(optimizedBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "image/webp",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error) {
        console.error("Thumbnail generation error:", error);
        return new NextResponse("Error generating thumbnail", { status: 500 });
    }
}
