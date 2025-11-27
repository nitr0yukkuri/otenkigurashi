// src/app/collection/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ItemIcon from '../components/ItemIcon';
import Footer from '../components/Footer';
import ItemDetailModal from '../components/ItemDetailModal';
import { getUserId } from '../lib/userId';

type WeatherType = "sunny" | "clear" | "rainy" | "cloudy" | "snowy" | "thunderstorm" | "windy" | "night";
const CURRENT_WEATHER_KEY = 'currentWeather';

const getBackgroundGradientClass = (weather: WeatherType | null): string => {
    switch (weather) {
        case 'clear': return 'bg-clear';
        case 'cloudy': return 'bg-cloudy';
        case 'rainy': return 'bg-rainy';
        case 'thunderstorm': return 'bg-thunderstorm';
        case 'snowy': return 'bg-snowy';
        case 'windy': return 'bg-windy';
        case 'night': return 'bg-night';
        case 'sunny':
        default: return 'bg-sunny';
    }
};

interface CollectionItem {
    id: number;
    name: string;
    description: string;
    iconName: string | null; // ★ 修正
    quantity: number;
    rarity: string;
    weather: string | null;
}

export default function CollectionPage() {
    const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState('bg-sunny');
    const [collection, setCollection] = useState<CollectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const storedWeather = localStorage.getItem(CURRENT_WEATHER_KEY) as WeatherType | null;
        setDynamicBackgroundClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');
    }, []);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const userId = getUserId();
                const response = await fetch(`/api/collection?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data = await response.json();

                if (Array.isArray(data)) {
                    setCollection(data);
                } else {
                    setCollection([]);
                }
            } catch (error) {
                console.error("コレクションの取得に失敗しました", error);
                setCollection([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, []);

    const handleItemClick = (item: CollectionItem) => {
        if (item.quantity > 0) {
            setSelectedItem(item);
            setIsDetailModalOpen(true);
        }
    };

    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <ItemDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                item={selectedItem}
            />

            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>

                <div className="flex-grow overflow-y-auto p-6">
                    <header className="mb-8">
                        <Link href="/" className={`mb-6 inline-block text-sm ${linkColor} transition-colors`}>← もどる</Link>
                        <h1 className={`text-4xl font-extrabold ${isNight ? 'text-white' : 'text-slate-800'} tracking-wider backdrop-blur-sm bg-white/30 rounded-lg px-4 py-1`}>ずかん</h1>
                        <p className={`${subTitleColor} mt-1`}>集めたアイテムを見てみよう</p>
                    </header>

                    {loading ? (
                        <p className="text-center animate-pulse">読み込み中...</p>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {collection.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`flex flex-col items-center justify-center p-2 bg-white/60 rounded-xl aspect-square transition-transform ${item.quantity > 0 ? 'cursor-pointer hover:scale-[1.05]' : ''}`}
                                    disabled={item.quantity === 0}
                                >
                                    <div className={`relative transition-opacity ${item.quantity === 0 ? 'opacity-30' : ''}`}>
                                        {/* ★ 修正: name, rarity, size を渡す */}
                                        <ItemIcon name={item.iconName} rarity={item.rarity} size={40} />
                                        {item.quantity > 0 && (
                                            <span className="absolute -top-1 -right-2 bg-slate-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {item.quantity}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs text-center mt-1 ${item.quantity === 0 ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>
                                        {item.quantity > 0 ? item.name : '？？？'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Footer />
            </main>
        </div>
    );
}