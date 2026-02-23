import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const continuationToken = searchParams.get("token") || undefined;

        if (!slug) {
            return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
        }

        const prefix = `${slug}/original/`;

        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
            MaxKeys: 100,
            ContinuationToken: continuationToken,
        });

        const response = await s3Client.send(command);

        // Cloudflare public URL mapping
        const baseUrl = process.env.NEXT_PUBLIC_R2_WEBSITE_URL;

        if (!baseUrl) {
            console.warn("NEXT_PUBLIC_R2_WEBSITE_URL not configured. Returning raw keys.");
        }

        const images = (response.Contents || [])
            .filter((item) => item.Key && item.Size && item.Size > 0)
            .map((item) => {
                // Build public URL if NEXT_PUBLIC_R2_WEBSITE_URL is available
                const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${item.Key}` : item.Key;
                return {
                    key: item.Key,
                    url: url,
                    lastModified: item.LastModified,
                    size: item.Size,
                };
            })
            .sort((a, b) => {
                // Sort newest first
                if (!a.lastModified || !b.lastModified) return 0;
                return b.lastModified.getTime() - a.lastModified.getTime();
            });

        return NextResponse.json({
            images,
            nextContinuationToken: response.NextContinuationToken,
            isTruncated: response.IsTruncated,
        });
    } catch (error) {
        console.error("Error listing objects:", error);
        return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
    }
}
