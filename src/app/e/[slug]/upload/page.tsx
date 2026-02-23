import UploadZone from "@/components/UploadZone";

export default async function UploadPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-3xl space-y-8 bg-white/20 backdrop-blur-xl rounded-[2rem] p-6 sm:p-12 border border-white/30 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-6xl sm:text-7xl font-cursive text-white drop-shadow-md">
                        Violeta
                    </h1>
                    <p className="text-lg text-white/90 uppercase tracking-[0.3em] ml-2 drop-shadow-sm">
                        Mis XV Años
                    </p>
                    <div className="pt-4">
                        <p className="text-white bg-black/20 inline-block px-6 py-2 rounded-full backdrop-blur-md font-medium text-sm sm:text-base border border-white/10">
                            ¡Ayúdame a capturar la magia de esta noche! Sube aquí tus fotos 📸
                        </p>
                    </div>
                </div>

                <UploadZone slug={resolvedParams.slug} />
            </div>
        </main>
    );
}
