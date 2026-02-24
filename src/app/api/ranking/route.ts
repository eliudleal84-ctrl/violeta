import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!slug) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    try {
        const rankingKey = `ranking:${slug}`;

        // Fetch top N items, with scores, descending
        const topPhotos = await redis.zrange(rankingKey, 0, limit - 1, { rev: true, withScores: true });

        return NextResponse.json({ ranking: topPhotos });
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return NextResponse.json({ error: "Failed to fetch ranking" }, { status: 500 });
    }
}
