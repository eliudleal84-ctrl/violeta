import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        // Very basic auth: Expecting Authorization: Bearer <token>
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];

        if (token !== process.env.ADMIN_TOKEN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!slug) {
            return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
        }

        const prefix = `${slug}/`; // Delete the entire slug prefix

        // We must list all objects first, since S3 doesn't have a simple "delete folder"
        // We handle this in chunks of 1000 (MaxKeys limit).
        let hasMore = true;
        let continuationToken: string | undefined = undefined;
        let totalDeleted = 0;

        while (hasMore) {
            const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            });

            const listResponse = await s3Client.send(listCommand);

            if (listResponse.Contents && listResponse.Contents.length > 0) {
                const objectsToDelete = listResponse.Contents.map((obj) => ({ Key: obj.Key }));

                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: BUCKET_NAME,
                    Delete: {
                        Objects: objectsToDelete,
                        Quiet: true,
                    },
                });

                await s3Client.send(deleteCommand);
                totalDeleted += objectsToDelete.length;
            }

            hasMore = !!listResponse.IsTruncated;
            continuationToken = listResponse.NextContinuationToken;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully deleted ${totalDeleted} objects from event #${slug}`
        });

    } catch (error) {
        console.error("Error purging event:", error);
        return NextResponse.json({ error: "Failed to purge event" }, { status: 500 });
    }
}
