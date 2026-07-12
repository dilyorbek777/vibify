'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bebas_Neue, Inter } from 'next/font/google';
import { Card, CardContent } from '@/components/ui/card';
import { Hash, Palette } from 'lucide-react';
import Link from 'next/link';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

// ---- TypeScript interfaces for Spotify API response ----
export interface TransformedLabel {
    transformedLabel: string;
}

export interface ImageSource {
    url: string;
    width: number;
    height: number;
}

export interface ImageArtwork {
    sources: ImageSource[];
}

export interface HexColor {
    hex: string;
}

export interface CardRepresentation {
    title: TransformedLabel;
    artwork: ImageArtwork;
    backgroundColor: HexColor;
}

export interface BrowseCardContainerData {
    __typename: "BrowseSectionContainer";
    data: {
        cardRepresentation: CardRepresentation;
    };
}

export interface BrowseXlinkData {
    __typename: "BrowseClientFeature";
    title: TransformedLabel;
    featureUri: string;
    artwork: ImageArtwork;
    backgroundColor: HexColor;
    iconOverlay?: ImageArtwork;
}

export interface SectionCardItem {
    uri: string;
    content: {
        __typename: "BrowseSectionContainerWrapper" | "BrowseXlinkResponseWrapper";
        data: BrowseCardContainerData | BrowseXlinkData;
    };
}

export interface BrowseSectionItem {
    uri: string;
    data: {
        __typename: "BrowseGridSectionData";
        title: TransformedLabel;
    };
    sectionItems: {
        items: SectionCardItem[];
    };
}

export interface BrowseStart {
    __typename: "BrowseSectionContainer";
    uri: string;
    sections: {
        items: BrowseSectionItem[];
    };
}

export interface SpotifyBrowseResponse {
    status: string;
    data: {
        browseStart: BrowseStart;
    };
}

export interface NormalizedCardInfo {
    uri: string;
    title: string;
    imageUrl: string;
    backgroundColor: string;
}

export function extractCardInfo(response: SpotifyBrowseResponse): NormalizedCardInfo[] {
    if (!response?.data?.browseStart?.sections?.items) {
        console.error('Invalid API response structure:', response);
        return [];
    }

    const sectionItems = response.data.browseStart.sections.items;
    const normalizedCards: NormalizedCardInfo[] = [];

    for (const section of sectionItems) {
        if (!section?.sectionItems?.items) continue;

        for (const item of section.sectionItems.items) {
            const content = item.content;

            if (content.__typename === "BrowseSectionContainerWrapper") {
                const containerData = content.data as BrowseCardContainerData;
                const card = containerData.data.cardRepresentation;

                normalizedCards.push({
                    uri: item.uri,
                    title: card.title.transformedLabel,
                    imageUrl: card.artwork.sources[0]?.url || "",
                    backgroundColor: card.backgroundColor.hex,
                });
            } else if (content.__typename === "BrowseXlinkResponseWrapper") {
                const xlinkData = content.data as BrowseXlinkData;

                normalizedCards.push({
                    uri: item.uri,
                    title: xlinkData.title.transformedLabel,
                    imageUrl: xlinkData.artwork.sources[0]?.url || "",
                    backgroundColor: xlinkData.backgroundColor.hex,
                });
            }
        }
    }

    return normalizedCards;
}

interface FlatTile {
    color: string;
    opacity: number;
    id: number;
    title: string;
    imageUrl: string;
    idUri: string;
}

const BG_COLS = 16;
const BG_ROWS = 10;

export default function HoverAnimPage() {
    const [hoveredBgTile, setHoveredBgTile] = useState<number | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [cardData, setCardData] = useState<NormalizedCardInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const fetchCardData = async () => {
            try {
                const url = 'https://spotify23.p.rapidapi.com/browse_all/';
                const options = {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': '4f8712d382mshfaa3517bffdad81p136abfjsn293bbff5b12b',
                        'x-rapidapi-host': 'spotify23.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    }
                };

                const response = await fetch(url, options);
                const result: SpotifyBrowseResponse = await response.json();
                console.log('API Response:', result);

                const normalizedData = extractCardInfo(result);
                setCardData(normalizedData);
                console.log('Extracted card data:', normalizedData.length);
            } catch (err) {
                console.error('Error fetching card data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCardData();
    }, []);

    const flatTiles = useMemo<FlatTile[]>(() => {
        const count = BG_COLS * BG_ROWS;
        const displayTiles: FlatTile[] = [];

        if (cardData.length > 0) {
            // Shuffle the card data to avoid repetition
            const shuffledData = [...cardData];
            for (let i = shuffledData.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]];
            }

            for (let i = 0; i < count; i++) {
                const card = shuffledData[i % shuffledData.length];
                displayTiles.push({
                    id: i,
                    color: card.backgroundColor,
                    opacity: 0.8,
                    title: card.title,
                    imageUrl: card.imageUrl,
                    idUri: card.uri
                });
            }

            console.log('First tile:', displayTiles[0]);
            console.log('Last tile:', displayTiles[displayTiles.length - 1]);
        }
        return displayTiles;
    }, [cardData]);

    const hoveredBgTileData = useMemo(() => {
        if (hoveredBgTile === null) return null;
        return flatTiles.find((t) => t.id === hoveredBgTile);
    }, [hoveredBgTile, flatTiles]);


    return (
        <main
            className="relative min-h-screen w-full overflow-hidden bg-[#050507] flex items-center justify-center pb-16 md:pb-0"
            onMouseMove={(e) => setCursorPosition({ x: e.clientX, y: e.clientY })}
        >
            {/* loading state */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#050507]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className={`${inter.className} text-white/60 text-sm`}>Loading...</p>
                    </div>
                </div>
            )}

            {/* full-bleed mosaic backdrop */}
            <div
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns: `repeat(${BG_COLS}, 1fr)` }}
            >
                {flatTiles.map((t, i) => (
                    <Link 
                        href={`/?q=${t.title}`}
                        key={i}
                        style={{
                            opacity: hoveredBgTile === t.id ? 1 : t.opacity,
                            transform: hoveredBgTile === t.id ? 'scale(1.1)' : 'scale(1)',
                            boxShadow: hoveredBgTile === t.id ? `0 0 20px ${t.color}, 0 0 40px rgba(0,0,0,0.8)` : 'none',
                            zIndex: hoveredBgTile === t.id ? 100 : 1,
                        }}
                        className="aspect-[2/3] cursor-pointer transition-all duration-300 rounded-sm overflow-hidden relative"
                        onMouseEnter={() => setHoveredBgTile(t.id)}
                        onMouseLeave={() => setHoveredBgTile(null)}
                    >
                        <img
                            src={t.imageUrl}
                            alt={t.title}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                ))}
            </div>

            {/* info card for background tiles */}
            {hoveredBgTileData && (
                <Link
                    href={`/music/${hoveredBgTileData.title}`}
                    className="absolute z-30 rounded-xl overflow-hidden transition-all duration-200 ease-out pointer-events-none will-change-transform border-white/10 backdrop-blur-md"
                    style={{
                        top: cursorPosition.y + 20,
                        left: cursorPosition.x + 20,
                        width: Math.min(280, window.innerWidth - 40),
                        height: Math.min(400, window.innerHeight - 100),
                        boxShadow: `
      0 0 0 1px ${hoveredBgTileData.color}25, 
      0 20px 40px rgba(0,0,0,0.6), 
      0 0 50px ${hoveredBgTileData.color}15
    `,
                        backgroundColor: hoveredBgTileData.color,
                    }}
                >
                    {/* Ambient Glow */}
                    <div
                        className="absolute bottom-[-20px] left-[-20px] w-40 h-40 opacity-30 blur-[40px] pointer-events-none rounded-full"
                        style={{ backgroundColor: hoveredBgTileData.color }}
                    />

                    {/* Contrast Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90 z-0" />

                    {/* Content Frame */}
                    <CardContent className="absolute inset-0 p-6 flex flex-col z-10 select-none">
                        <div className="flex flex-col gap-4 h-full">
                            {/* Artwork Container */}
                            <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-zinc-900">
                                <img
                                    src={hoveredBgTileData.imageUrl}
                                    alt={hoveredBgTileData.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Header Title */}
                            <h3 className={`${bebas.className} text-white text-4xl tracking-wide leading-none uppercase`}>
                                {hoveredBgTileData.title}
                            </h3>
                        </div>

                        {/* Separator Line */}
                        <div className="w-full h-[1px] bg-white/10 my-3.5" />

                        {/* Technical Specs Layout */}
                        <div className={`${inter.className} space-y-2 text-[11px]`}>
                            {/* ID Entry */}
                            <div className="flex justify-between items-center text-zinc-400">
                                <span className="flex items-center gap-1.5 text-white/50 font-normal">
                                    <Hash className="w-3 h-3 text-white/40" /> ID
                                </span>
                                <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-[10px] text-zinc-300 border border-white/5">
                                    {hoveredBgTileData.id}
                                </span>
                            </div>

                            {/* Color Code Entry */}
                            <div className="flex justify-between items-center text-zinc-400">
                                <span className="flex items-center gap-1.5 text-white/50 font-normal">
                                    <Palette className="w-3 h-3 text-white/40" /> Color
                                </span>
                                <span className="font-mono text-[10px] flex items-center gap-1 font-semibold" style={{ color: hoveredBgTileData.color }}>
                                    {hoveredBgTileData.color.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Link>
            )}
        </main>
    );
}