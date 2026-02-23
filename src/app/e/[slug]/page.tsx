import Link from "next/link";
import { Camera, Image as ImageIcon, Settings } from "lucide-react";

export default function EventHome({ params }: { params: { slug: string } }) {
    const { slug } = params;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Main Content Container - Glassmorphism */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden relative">

                {/* Hero / Header Section with Arched border inspiration */}
                <div className="relative pt-12 pb-8 px-6 text-center border-b border-white/20">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none" />

                    <h2 className="font-serif text-5xl md:text-6xl text-white tracking-widest drop-shadow-md mb-2">
                        VIOLETA
                    </h2>

                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px bg-white/50 w-12" />
                        <span className="font-cursive text-3xl text-purple-200 tracking-wide">Mis XV Años</span>
                        <div className="h-px bg-white/50 w-12" />
                    </div>
                </div>

                {/* Navigation Menu Buttons */}
                <div className="p-8 space-y-5">
                    <p className="text-center text-white/90 text-sm font-medium mb-6 px-4">
                        ¡Bienvenido a mi galería digital! Elige una opción para continuar.
                    </p>

                    <Link
                        href={`/e/${slug}/upload`}
                        className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-400/50 hover:scale-105"
                    >
                        <Camera className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" />
                        <span>Subir Fotos 📸</span>
                    </Link>

                    <Link
                        href={`/e/${slug}/gallery`}
                        className="group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-lg transition-all duration-300 border border-white/30 hover:scale-105"
                    >
                        <ImageIcon className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" />
                        <span>Ver Galería ✨</span>
                    </Link>
                </div>
            </div>

            {/* Subtle Admin Footer Link */}
            <div className="mt-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
                <Link
                    href={`/admin/${slug}`}
                    className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white"
                >
                    <Settings className="w-3 h-3" />
                    <span>Administración</span>
                </Link>
            </div>
        </main>
    );
}
