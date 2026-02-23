"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, X, Maximize, Minimize, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

interface ImageItem {
    key: string;
    url: string;
    lastModified: string;
}

export default function SlideshowViewer({ slug }: { slug: string }) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [intervalTime, setIntervalTime] = useState(5000); // 5 seconds default
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);

    // Settings menu
    const [showSettings, setShowSettings] = useState(false);

    const fetchImages = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`/api/list?slug=${slug}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.images) {
                setImages(data.images);
            }
        } catch (err) {
            console.error("Failed to fetch images for slideshow", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [slug]);

    // Initial fetch and Polling (every 15s)
    useEffect(() => {
        fetchImages();
        const pollInterval = setInterval(() => {
            fetchImages(true);
        }, 15000);
        return () => clearInterval(pollInterval);
    }, [fetchImages]);

    // Slideshow advance
    useEffect(() => {
        if (!isPlaying || images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, intervalTime);

        return () => clearInterval(timer);
    }, [isPlaying, images.length, intervalTime]);

    // Hide controls after 3 seconds of inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (!showSettings) setShowControls(false);
            }, 3000);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("touchstart", resetTimer);
        window.addEventListener("keydown", resetTimer);
        resetTimer();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("touchstart", resetTimer);
            window.removeEventListener("keydown", resetTimer);
        };
    }, [showSettings]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    if (loading && images.length === 0) {
        return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-white/50" />
                <p className="text-white/70">Cargando presentación...</p>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white space-y-6">
                <p className="text-xl text-white/70">No hay fotos para mostrar.</p>
                <Link
                    href={`/e/${slug}/gallery`}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    Volver a la Galería
                </Link>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black overflow-hidden">
            {/* Current Image */}
            {images.map((img, index) => (
                <div
                    key={img.key}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    <img
                        src={img.url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-contain"
                    />
                </div>
            ))}

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
                    <Link
                        href={`/e/${slug}/gallery`}
                        className="p-3 bg-black/40 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-sm"
                        onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen();
                        }}
                    >
                        <X className="w-6 h-6" />
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-3 bg-black/40 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <Settings className="w-6 h-6" />
                        </button>

                        {/* Settings Menu */}
                        {showSettings && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                                <p className="text-white/60 text-xs font-semibold mb-3 uppercase tracking-wider">Velocidad</p>
                                <div className="space-y-2">
                                    {[
                                        { label: "Rápido (3s)", val: 3000 },
                                        { label: "Medio (5s)", val: 5000 },
                                        { label: "Lento (8s)", val: 8000 },
                                    ].map((speed) => (
                                        <button
                                            key={speed.val}
                                            onClick={() => {
                                                setIntervalTime(speed.val);
                                                setShowSettings(false);
                                            }}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${intervalTime === speed.val
                                                    ? "bg-white/20 text-white font-medium"
                                                    : "text-white/70 hover:bg-white/10"
                                                }`}
                                        >
                                            {speed.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
                    <div className="text-white/80 font-medium tracking-widest text-sm drop-shadow-md">
                        {currentIndex + 1} <span className="text-white/40">/</span> {images.length}
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 bg-white text-black hover:scale-110 active:scale-95 rounded-full transition-all shadow-xl"
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 fill-black" />
                        ) : (
                            <Play className="w-8 h-8 fill-black ml-1" />
                        )}
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-3 bg-black/40 hover:bg-black/80 rounded-full text-white/80 hover:text-white transition-colors backdrop-blur-sm"
                    >
                        {isFullscreen ? (
                            <Minimize className="w-6 h-6" />
                        ) : (
                            <Maximize className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
