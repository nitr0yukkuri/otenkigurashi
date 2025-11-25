'use client';

import { Suspense, useState, useEffect } from 'react';
import CharacterFace from '../components/CharacterFace';
import WeatherIcon from '../components/WeatherIcon';
import Link from 'next/link';
import Footer from '../components/Footer';
import ItemGetModal from '../components/ItemGetModal';
import { useWalkLogic } from './useWalkLogic';
import { getWalkMessage } from './utils';

function WalkPageComponent() {
    const {
        weather,
        location,
        loading,
        error,
        obtainedItem,
        isItemModalOpen,
        dynamicBackgroundClass,
        handleModalClose,
        isNight,
    } = useWalkLogic();

    const [petName, setPetName] = useState("てんちゃん");

    useEffect(() => {
        const storedName = localStorage.getItem('otenki-gurashi-petName');
        if (storedName) {
            setPetName(storedName);
        }
    }, []);

    const linkColor = isNight ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-700';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';
    const panelTextColor = isNight ? 'text-white' : 'text-slate-700';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <ItemGetModal isOpen={isItemModalOpen} onClose={handleModalClose} itemName={obtainedItem.name} iconName={obtainedItem.iconName} rarity={obtainedItem.rarity} />

            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} transition-colors duration-500 ${dynamicBackgroundClass}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow flex flex-col p-6 items-center justify-between">
                    <div className="w-full">
                        {(!error || loading) && (
                            <Link href="/" className={`mb-6 inline-block text-sm ${linkColor} transition-colors`}>← ホーム</Link>
                        )}
                        <header className="mb-8 text-center">
                            <h1 className={`text-3xl font-extrabold ${titleColor} tracking-wider`}>
                                {loading ? 'おさんぽ準備中...' : error ? 'おさんぽ失敗...' : 'おさんぽ中...'}
                            </h1>
                            <p className={`${subTitleColor} mt-1`}>{location}</p>
                        </header>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow p-4">
                        {loading ? (
                            <div className="animate-pulse text-center">
                                <div className="w-40 h-40 rounded-full bg-white/50 p-2 mb-4 mx-auto"></div>
                                <p className={panelTextColor}>{petName} 準備中...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <div className="w-40 h-40 rounded-full bg-white p-2 mb-4 mx-auto">
                                    <CharacterFace mood={'sad'} />
                                </div>
                                <p className="text-red-600 bg-red-100 p-3 rounded-lg shadow-sm">{error}</p>
                                <Link href="/" className="mt-4 inline-block bg-gray-900 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-700 transition-colors">
                                    ホームへもどる
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4"><WeatherIcon type={weather || 'sunny'} size={60} /></div>
                                <div className="w-40 h-40 rounded-full bg-white p-2 mb-4">
                                    <CharacterFace mood={'happy'} />
                                </div>
                                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-md max-w-xs text-center">
                                    <p className="text-slate-700 font-medium">{getWalkMessage(weather || undefined)}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {!error && <Footer />}
            </main>
        </div>
    );
}

export default function WalkPage() {
    return (
        <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center">ローディング中...</div>}>
            <WalkPageComponent />
        </Suspense>
    );
}