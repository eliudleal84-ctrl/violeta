"use client";

import { useState, useEffect } from "react";

interface ReactionCounts {
    heart: number;
    laugh: number;
    sparkle: number;
    crown: number;
}

interface ReactionBarProps {
    imageKey: string;
    initialCounts?: ReactionCounts;
    className?: string;
}

const REACTIONS = [
    { type: "heart", emoji: "❤️" },
    { type: "laugh", emoji: "😂" },
    { type: "sparkle", emoji: "✨" },
    { type: "crown", emoji: "👑" }
] as const;

export default function ReactionBar({ imageKey, initialCounts, className = "" }: ReactionBarProps) {
    const [counts, setCounts] = useState<ReactionCounts | null>(initialCounts || null);
    const [isAnimating, setIsAnimating] = useState<string | null>(null);

    // Fetch individually if not provided by a batch
    useEffect(() => {
        if (!initialCounts) {
            fetch(`/api/reactions?keys=${encodeURIComponent(imageKey)}`)
                .then(res => res.json())
                .then(data => {
                    if (data[imageKey]) {
                        setCounts(data[imageKey]);
                    }
                })
                .catch(console.error);
        } else {
            setCounts(initialCounts);
        }
    }, [imageKey, initialCounts]);

    const handleReact = async (type: keyof ReactionCounts) => {
        // Optimistic UI update
        setCounts(prev => {
            const current = prev || { heart: 0, laugh: 0, sparkle: 0, crown: 0 };
            return { ...current, [type]: current[type] + 1 };
        });

        setIsAnimating(type);
        setTimeout(() => setIsAnimating(null), 1000);

        try {
            await fetch("/api/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: imageKey, type })
            });
        } catch (error) {
            console.error("Failed to post reaction:", error);
            // Revert on error
            setCounts(prev => {
                const current = prev || { heart: 0, laugh: 0, sparkle: 0, crown: 0 };
                return { ...current, [type]: Math.max(0, current[type] - 1) };
            });
        }
    };

    if (!counts) return null; // Hide until loaded to prevent layout shift

    return (
        <div className={`flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg ${className}`}>
            {REACTIONS.map(({ type, emoji }) => (
                <button
                    key={type}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleReact(type as keyof ReactionCounts);
                    }}
                    className="relative flex items-center justify-center hover:scale-125 transition-transform duration-200 group"
                    title={`Reaccionar con ${emoji}`}
                >
                    <span className="text-xl filter drop-shadow-md">{emoji}</span>

                    {counts[type as keyof ReactionCounts] > 0 && (
                        <span className="absolute -bottom-3 text-[10px] font-bold text-white bg-purple-600/90 px-1.5 rounded-full whitespace-nowrap opacity-100">
                            {counts[type as keyof ReactionCounts]}
                        </span>
                    )}

                    {/* Floating Animation */}
                    {isAnimating === type && (
                        <span className="absolute top-0 left-0 text-3xl pointer-events-none animate-float-up inline-block">
                            {emoji}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
