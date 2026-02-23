"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import ImageModal from "./ImageModal";
import Link from "next/link";

interface ImageItem {
    key: string;
    url: string;
    lastModified: string;
}

export default function GalleryGrid({ slug }: { slug: string }) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalState, setModalState] = useState({ isOpen: false, index: 0 });

    // Pagination & Infinite Scroll states
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchImages = async (reset = false) => {
        if (reset) {
            setLoading(true);
        } else {
            setIsFetchingMore(true);
        }
        setError(null);
        try {
            const tokenParam = (!reset && nextToken) ? `&token=${encodeURIComponent(nextToken)}` : "";
            const res = await fetch(`/api/list?slug=${slug}${tokenParam}`);
            if (!res.ok) throw new Error("Failed to load images");
            const data = await res.json();

            setImages(prev => reset ? (data.images || []) : [...prev, ...(data.images || [])]);
            setNextToken(data.nextContinuationToken || null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchImages(true);
    }, [slug]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && nextToken && !isFetchingMore) {
                    fetchImages();
                }
            },
            { threshold: 0.1, rootMargin: "100px" } // trigger 100px before reaching the bottom
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [nextToken, isFetchingMore, slug]);

    if (loading && images.length === 0) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Cargando galería...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="font-medium text-lg">{error}</p>
                <button
                    onClick={() => fetchImages(true)}
                    className="mt-6 flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-gray-500 space-y-4">
                <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
                    Aún no hay fotos en este evento
                </p>
                <Link
                    href={`/e/${slug}/upload`}
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full hover:scale-105 transition-transform"
                >
                    ¡Sé el primero en subir una!
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {images.length} foto{images.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-3">
                    <Link
                        href={`/e/${slug}/upload`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:block"
                    >
                        Subir más fotos
                    </Link>
                    <Link
                        href={`/e/${slug}/slideshow`}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
                    >
                        Ver Slideshow
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {images.map((img, index) => (
                    <div
                        key={img.key}
                        onClick={() => setModalState({ isOpen: true, index })}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Use the new /api/thumb endpoint for optimized loading */}
                        <img
                            src={`/api/thumb?key=${encodeURIComponent(img.key)}&w=400`}
                            alt="Event photo"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                ))}
            </div>

            {/* Infinite Scroll Observer Target */}
            {nextToken && (
                <div ref={observerTarget} className="w-full flex justify-center py-8">
                    {isFetchingMore ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    ) : (
                        <div className="h-8"></div> // Placeholder so the observer doesn't jump
                    )}
                </div>
            )}

            <ImageModal
                images={images}
                currentIndex={modalState.index}
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onNavigate={(index) => setModalState({ ...modalState, index })}
            />
        </div>
    );
}
