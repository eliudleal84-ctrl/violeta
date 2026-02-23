"use client";

import { useState, useEffect, use } from "react";
import { Lock, FolderOpen, Image as ImageIcon, Trash2, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

interface Stats {
    count: number;
    latest: string | null;
}

export default function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState("");

    // Stats state
    const [stats, setStats] = useState<Stats>({ count: 0, latest: null });
    const [loadingStats, setLoadingStats] = useState(false);

    // Purge state
    const [isPurging, setIsPurging] = useState(false);
    const [purgeError, setPurgeError] = useState("");
    const [confirmSlug, setConfirmSlug] = useState("");
    const [showPurgeModal, setShowPurgeModal] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.length > 5) {
            setIsAuthenticated(true);
            fetchStats(token);
        }
    };

    const fetchStats = async (authToken: string) => {
        setLoadingStats(true);
        try {
            // We reuse /api/list which doesn't actually require a token for reading, 
            // but in a real-world scenario you'd want a separate /api/stats endpoint.
            const res = await fetch(`/api/list?slug=${slug}`);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    count: data.images?.length || 0,
                    latest: data.images?.[0]?.lastModified || null
                });
            }
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handlePurge = async () => {
        if (confirmSlug !== slug) {
            setPurgeError("El nombre no coincide.");
            return;
        }

        setIsPurging(true);
        setPurgeError("");

        try {
            const res = await fetch(`/api/purge?slug=${slug}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to purge");
            }

            // Success
            setStats({ count: 0, latest: null });
            setShowPurgeModal(false);
            alert("¡El evento ha sido borrado por completo!");
        } catch (error: any) {
            setPurgeError(error.message);
        } finally {
            setIsPurging(false);
            setConfirmSlug("");
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                        <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <Lock className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-bold dark:text-white">Acceso Admin</h1>
                        <p className="text-sm text-gray-500 text-center">
                            Ingresa el token de administrador para gestionar el evento #{slug}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ADMIN_TOKEN"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                        >
                            Entrar <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <FolderOpen className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Panel del Evento</h1>
                        <p className="text-gray-500 dark:text-gray-400">#{slug}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Fotos</p>
                                <h3 className="text-4xl font-black mt-2 dark:text-white">
                                    {loadingStats ? <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> : stats.count}
                                </h3>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <ImageIcon className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Última subida</p>
                        <p className="font-medium dark:text-white">
                            {loadingStats ? "Cargando..." : (stats.latest ? new Date(stats.latest).toLocaleString() : "Ninguna")}
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl p-6 sm:p-8 mt-12">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full mt-1">
                            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-900 dark:text-red-400">Zona de Peligro</h2>
                            <p className="text-red-700 dark:text-red-300 mt-2 text-sm sm:text-base">
                                Borrar el evento eliminará permanentemente todas las imágenes asociadas a <strong>#{slug}</strong> directamente desde Cloudflare R2. Esta acción no se puede deshacer.
                            </p>

                            <button
                                onClick={() => setShowPurgeModal(true)}
                                className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" /> Borrar Evento Completamente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mass Download Note */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 mt-8">
                    <h2 className="text-lg font-bold dark:text-white mb-2">Descarga Masiva (Para fotógrafos)</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Para descargar las {stats.count} fotos en su resolución original sin saturar el navegador, recomendamos usar una herramienta de línea de comandos como `rclone` apuntando al prefijo <code>{slug}/</code>.
                    </p>
                    <code className="block p-4 bg-gray-100 dark:bg-black rounded-xl text-xs sm:text-sm text-pink-600 dark:text-pink-400 overflow-x-auto whitespace-nowrap">
                        rclone copy R2:{process.env.NEXT_PUBLIC_R2_BUCKET_NAME || "eventocam"}/{slug}/ ./fotos-{slug}
                    </code>
                </div>

                {/* Purge Modal */}
                {showPurgeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-red-100 dark:border-red-900/50">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2">¿Estás absolutamente seguro?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Escribe <strong>{slug}</strong> para confirmar el borrado total.
                            </p>

                            <input
                                type="text"
                                value={confirmSlug}
                                onChange={(e) => setConfirmSlug(e.target.value)}
                                placeholder={`Escribe ${slug}`}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white mb-2"
                            />

                            {purgeError && <p className="text-xs text-red-500 mb-4 font-medium">{purgeError}</p>}

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setShowPurgeModal(false);
                                        setConfirmSlug("");
                                        setPurgeError("");
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handlePurge}
                                    disabled={isPurging || confirmSlug !== slug}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                                >
                                    {isPurging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    {isPurging ? "Borrando..." : "Sí, borrar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
