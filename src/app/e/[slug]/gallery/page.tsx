import GalleryGrid from "@/components/GalleryGrid";
import Link from "next/link";
import { Camera } from "lucide-react";

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-20">
            {/* Sticky Top Nav */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Camera className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                #{resolvedParams.slug}
                            </h1>
                        </div>

                        <Link
                            href={`/e/${resolvedParams.slug}/upload`}
                            className="sm:hidden px-4 py-2 text-sm font-semibold rounded-full bg-black dark:bg-white text-white dark:text-black transition-colors"
                        >
                            Subir
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <GalleryGrid slug={resolvedParams.slug} />
            </div>
        </main>
    );
}
