import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// GET: Fetch reactions for a list of image keys
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get("keys"); // comma-separated keys

    if (!keysParam) {
        return NextResponse.json({ error: "Missing keys parameter" }, { status: 400 });
    }

    const keys = keysParam.split(",");

    try {
        // Use a pipeline to fetch all hashes at once for performance
        const pipeline = redis.pipeline();
        for (const key of keys) {
            pipeline.hgetall(`reactions:${key}`);
        }

        const results = await pipeline.exec();

        // Map results back to the keys
        const responseData: Record<string, Record<string, number>> = {};
        keys.forEach((key, index) => {
            responseData[key] = (results[index] as Record<string, number>) || { heart: 0, laugh: 0, sparkle: 0, crown: 0 };
        });

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error fetching reactions:", error);
        return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
    }
}

// POST: Increment a reaction
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, type } = body;

        // key example: mis-xv-violeta/original/foto.jpg
        // type example: heart

        if (!key || !type) {
            return NextResponse.json({ error: "Missing key or type" }, { status: 400 });
        }

        const validTypes = ["heart", "laugh", "sparkle", "crown"];
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
        }

        const redisKey = `reactions:${key}`;

        // Increment the specific reaction count
        const newValue = await redis.hincrby(redisKey, type, 1);

        // Update the global ranking for this slug
        const slugMatch = key.split('/')[0];
        if (slugMatch) {
            const rankingKey = `ranking:${slugMatch}`;
            // Increment the image's score in the sorted set
            await redis.zincrby(rankingKey, 1, key);
        }

        return NextResponse.json({ success: true, newValue });
    } catch (error) {
        console.error("Error incrementing reaction:", error);
        return NextResponse.json({ error: "Failed to increment reaction" }, { status: 500 });
    }
}
