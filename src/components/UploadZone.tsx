"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    errorMessage?: string;
}

export default function UploadZone({ slug }: { slug: string }) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const validateFile = (file: File) => {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return "Formato no soportado (usa JPG, PNG, WEBP).";
        }
        // Limit to 20MB
        if (file.size > 20 * 1024 * 1024) {
            return "La imagen es demasiado grande (máximo 20MB).";
        }
        return null;
    };

    const handleFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const addedFiles: UploadFile[] = Array.from(newFiles).map((file) => {
                const error = validateFile(file);
                return {
                    id: Math.random().toString(36).substring(2, 9) + Date.now(),
                    file,
                    progress: 0,
                    status: error ? "error" : "pending",
                    errorMessage: error || undefined,
                };
            });

            setFiles((prev) => [...prev, ...addedFiles]);

            // Start uploading valid pending files immediately
            addedFiles.forEach((uploadItem) => {
                if (uploadItem.status === "pending") {
                    uploadFile(uploadItem);
                }
            });
        },
        [slug]
    );

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const uploadFile = async (item: UploadFile) => {
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)));

        try {
            // 1. Get presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    filename: item.file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase(),
                    contentType: item.file.type,
                }),
            });

            if (!res.ok) throw new Error("Error obtaining upload credentials");
            const { signedUrl } = await res.json();

            // 2. Upload file via XHR to track progress
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        setFiles((prev) =>
                            prev.map((f) => (f.id === item.id ? { ...f, progress: percentComplete } : f))
                        );
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Pre-warm the thumbnail generation in the background
                        const safeName = item.file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
                        fetch(`/api/thumb?key=${encodeURIComponent(slug + "/original/" + safeName)}&w=400`).catch(() => { });

                        resolve(xhr.responseText);
                    } else {
                        console.error("XHR failed", xhr.status, xhr.responseText);
                        reject(new Error("Upload failed"));
                    }
                };

                xhr.onerror = () => reject(new Error("Network error during upload"));

                xhr.open("PUT", signedUrl);
                xhr.setRequestHeader("Content-Type", item.file.type);
                xhr.send(item.file);
            });

            setFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, status: "success", progress: 100 } : f))
            );
        } catch (error: any) {
            console.error(error);
            setFiles((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: error.message } : f))
            );
        }
    };

    const allFinished = files.length > 0 && files.every((f) => f.status === "success" || f.status === "error");
    const hasSuccessful = files.some((f) => f.status === "success");

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer backdrop-blur-sm ${isDragActive
                    ? "border-purple-300 bg-purple-500/20 scale-105"
                    : "border-white/40 hover:border-white/70 bg-white/10 hover:bg-white/20"
                    }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                        if (e.target.files) handleFiles(e.target.files);
                        e.target.value = ""; // Reset input so same file can be selected again
                    }}
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-5 bg-white/20 rounded-full shadow-lg backdrop-blur-md">
                        <UploadCloud className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white drop-shadow-sm">
                            Toca aquí para seleccionar fotos
                        </h3>
                        <p className="text-sm text-white/80 font-medium">
                            O arrástralas desde tu galería
                        </p>
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-white/60 bg-black/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                            JPG, PNG o WEBP - Máx 20MB
                        </p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
                            >
                                <div className="p-2 bg-white/30 rounded-xl shrink-0">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-sm font-semibold text-white truncate drop-shadow-sm">
                                            {file.file.name}
                                        </p>
                                        <span className="text-xs font-medium text-white/80">
                                            {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>

                                    {file.status === "error" ? (
                                        <p className="text-xs text-red-300 mt-1 font-medium bg-red-900/40 px-2 py-1 rounded-md inline-block">{file.errorMessage}</p>
                                    ) : (
                                        <div className="w-full bg-black/20 rounded-full h-2 mt-2 border border-white/10 hidden sm:block">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)] ${file.status === "success" ? "bg-green-400" : "bg-purple-300"
                                                    }`}
                                                style={{ width: `${file.progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex items-center pr-1">
                                    {file.status === "success" && (
                                        <CheckCircle className="w-6 h-6 text-green-300 drop-shadow-md" />
                                    )}
                                    {file.status === "error" && (
                                        <AlertCircle className="w-6 h-6 text-red-400 drop-shadow-md" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {allFinished && hasSuccessful && (
                        <div className="pt-6 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Link
                                href={`/e/${slug}/gallery`}
                                className="inline-flex items-center px-8 py-4 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/50 backdrop-blur-md"
                            >
                                ✨ Ver la Galería Completa ✨
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
