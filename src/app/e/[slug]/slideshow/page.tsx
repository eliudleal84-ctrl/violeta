import SlideshowViewer from "@/components/SlideshowViewer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Slideshow - Eventocam",
};

export default async function SlideshowPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    return <SlideshowViewer slug={resolvedParams.slug} />;
}
