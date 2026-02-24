"use client";

import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useCallback } from "react";
import ReactionBar from "./ReactionBar";

interface ImageItem {
    key: string;
    url: string;
    lastModified: string;
}

interface ImageModalProps {
    images: ImageItem[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export default function ImageModal({ images, currentIndex, isOpen, onClose, onNavigate }: ImageModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
            if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
        },
        [isOpen, currentIndex, images.length, onClose, onNavigate]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    const handleDownload = async () => {
        try {
            const response = await fetch(currentImage.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            // Extract filename from key or URL
            const filename = currentImage.key.split("/").pop() || "image.jpg";
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Top Controls */}
            <div className="absolute top-0 right-0 p-4 flex gap-4 z-50">
                <button
                    onClick={handleDownload}
                    className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full"
                    title="Download Image"
                >
                    <Download className="w-6 h-6" />
                </button>
                <button
                    onClick={onClose}
                    className="p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full"
                    title="Close Modal"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation Controls */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/60 rounded-full z-50"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={() => onNavigate((currentIndex + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white transition-colors bg-black/20 hover:bg-black/60 rounded-full z-50"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12">
                <img
                    src={currentImage.url}
                    alt={`Event image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain cursor-default select-none animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full px-4">
                <ReactionBar imageKey={currentImage.key} />
                <div className="px-4 py-2 bg-black/50 rounded-full text-white/80 text-sm font-medium tracking-wide">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </div>
    );
}
