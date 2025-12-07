// src/app/walk/page.tsx

'use client';

import { Suspense, useState, useEffect } from 'react';
// CharacterFace の代わりに CharacterDisplay をインポート
import CharacterDisplay, { EquipmentState } from '../components/CharacterDisplay';
import WeatherIcon from '../components/WeatherIcon';
import Link from 'next/link';
import ItemGetModal from '../components/ItemGetModal';
import { useWalkLogic } from './useWalkLogic';
import { getWalkMessage, getWalkStage } from './utils';

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
        stage
    } = useWalkLogic();

    const [petName, setPetName] = useState("てんちゃん");
    const [petColor, setPetColor] = useState("white");
    const [cheekColor, setCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null, room: null });

    // ★追加: メッセージを固定化するためのState
    const [fixedMessage, setFixedMessage] = useState<string>("");

    useEffect(() => {
        const storedName = localStorage.getItem('otenki-gurashi-petName');
        if (storedName) {
            setPetName(storedName);
        }

        const storedColor = localStorage.getItem('otenki-gurashi-petColor');
        if (storedColor) setPetColor(storedColor);

        const storedCheek = localStorage.getItem('otenki-gurashi-petCheekColor');
        if (storedCheek) setCheekColor(storedCheek);

        const storedEquipment = localStorage.getItem('otenki-gurashi-petEquipment');
        if (storedEquipment) {
            try {
                const parsed = JSON.parse(storedEquipment);
                if (typeof parsed === 'string') {
                    setPetEquipment({ head: parsed, hand: null, floating: null, room: null });
                } else {
                    setPetEquipment({ head: null, hand: null, floating: null, room: null, ...parsed });
                }
            } catch {
                setPetEquipment({ head: storedEquipment, hand: null, floating: null, room: null });
            }
        }
    }, []);

    // ★追加: 天気情報が確定したタイミングでメッセージを一度だけ生成して固定する
    useEffect(() => {
        if (weather && !fixedMessage) {
            setFixedMessage(getWalkMessage(weather));
        }
    }, [weather, fixedMessage]);

    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';

    const stageName = getWalkStage(stage);

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <ItemGetModal isOpen={isItemModalOpen} onClose={handleModalClose} itemName={obtainedItem.name} iconName={obtainedItem.iconName} rarity={obtainedItem.rarity} />

            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} transition-colors duration-500 ${dynamicBackgroundClass}`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>
                <div className="flex-grow flex flex-col p-6 items-center justify-between">
                    <div className="w-full mt-8">
                        <header className="mb-8 text-center">
                            <h1 className={`text-3xl font-extrabold ${titleColor} tracking-wider`}>
                                {loading ? 'おさんぽ中...' : error ? 'おさんぽ失敗...' : 'おさんぽ中...'}
                            </h1>
                            <div className="flex flex-col items-center gap-1 mt-2">
                                <p className={`text-lg font-bold ${titleColor} opacity-90`}>{stageName}</p>
                                <p className={`${subTitleColor} text-sm`}>{location}</p>
                            </div>
                        </header>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-grow p-4">
                        {error ? (
                            <div className="text-center">
                                <div className="scale-90 mb-4">
                                    <CharacterDisplay
                                        petName=""
                                        petColor={petColor}
                                        cheekColor={cheekColor}
                                        equipment={petEquipment}
                                        mood="sad"
                                        message={null}
                                        onCharacterClick={() => { }}
                                        isNight={isNight}
                                        isStatic={true}
                                    />
                                </div>
                                <p className="text-red-600 bg-red-100 p-3 rounded-lg shadow-sm">{error}</p>
                                <Link href="/" className="mt-4 inline-block bg-gray-900 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-700 transition-colors">
                                    ホームへもどる
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <WeatherIcon type={weather || 'sunny'} size={60} />
                                </div>

                                <div className="scale-90 mb-4">
                                    <CharacterDisplay
                                        petName={petName}
                                        petColor={petColor}
                                        cheekColor={cheekColor}
                                        equipment={petEquipment}
                                        mood="happy"
                                        message={null}
                                        onCharacterClick={() => { }}
                                        isNight={isNight}
                                        isStatic={true}
                                    />
                                </div>

                                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-md max-w-xs text-center">
                                    <p className="text-slate-700 font-medium">
                                        {/* ★修正: 固定されたメッセージを表示 */}
                                        {fixedMessage || "てくてく…"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
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