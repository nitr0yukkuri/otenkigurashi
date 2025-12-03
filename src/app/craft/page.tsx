// src/app/craft/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ItemIcon from '../components/ItemIcon';
import TeruTeruIcon from '../components/TeruTeruIcon'; // ★追加
import Footer from '../components/Footer';
import ItemGetModal from '../components/ItemGetModal';
import { getUserId } from '../lib/userId';
import { RECIPES, Recipe } from '../lib/recipes';
import { getBackgroundGradientClass, WeatherType } from '../lib/weatherUtils';
import { IoHammer, IoArrowForward } from 'react-icons/io5';

const CURRENT_WEATHER_KEY = 'currentWeather';

export default function CraftPage() {
    const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState('bg-sunny');
    const [isNight, setIsNight] = useState(false);
    const [inventory, setInventory] = useState<Record<string, number>>({});
    // アイテムの詳細情報（アイコンやレア度）を保持するマップ
    const [itemDetails, setItemDetails] = useState<Record<string, { iconName: string | null, rarity: string }>>({});
    const [loading, setLoading] = useState(true);
    const [craftingId, setCraftingId] = useState<string | null>(null);
    const [obtainedItem, setObtainedItem] = useState<{ name: string, iconName: string, rarity: string } | null>(null);

    useEffect(() => {
        const storedWeather = localStorage.getItem(CURRENT_WEATHER_KEY) as WeatherType | null;
        setDynamicBackgroundClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');
    }, []);

    const fetchInventory = async () => {
        try {
            const userId = getUserId();
            const res = await fetch(`/api/collection?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                const invMap: Record<string, number> = {};
                const detailsMap: Record<string, { iconName: string | null, rarity: string }> = {};

                data.forEach((item: any) => {
                    invMap[item.name] = item.quantity;
                    detailsMap[item.name] = { iconName: item.iconName, rarity: item.rarity };
                });

                setInventory(invMap);
                setItemDetails(detailsMap);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleCraft = async (recipe: Recipe) => {
        if (craftingId) return;
        setCraftingId(recipe.id);

        try {
            const userId = getUserId();
            const res = await fetch('/api/craft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId: recipe.id, userId })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'クラフトに失敗しました');
                return;
            }

            const data = await res.json();
            if (data.success && data.item) {
                // 在庫を更新
                await fetchInventory();
                setObtainedItem({
                    name: data.item.name,
                    iconName: data.item.iconName,
                    rarity: data.item.rarity
                });
            }
        } catch (e) {
            alert('エラーが発生しました');
        } finally {
            setCraftingId(null);
        }
    };

    const backButtonClass = isNight
        ? 'bg-black/20 text-gray-200 hover:bg-black/40'
        : 'bg-white/40 text-slate-700 hover:bg-white/60';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const titleColor = isNight ? 'text-white' : 'text-slate-800';

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <ItemGetModal
                isOpen={!!obtainedItem}
                onClose={() => setObtainedItem(null)}
                itemName={obtainedItem?.name || null}
                iconName={obtainedItem?.iconName || null}
                rarity={obtainedItem?.rarity || null}
            />

            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-slate-700'} ${dynamicBackgroundClass} transition-all duration-500`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>

                <div className="flex-grow overflow-y-auto p-6">
                    <header className="mb-8">
                        <Link href="/collection" className={`mb-6 inline-block px-4 py-2 rounded-full backdrop-blur-md shadow-sm text-sm font-extrabold transition-all ${backButtonClass}`}>
                            ← ずかん
                        </Link>
                        <div>
                            <h1 className={`text-4xl font-extrabold ${titleColor} tracking-wider flex items-center gap-2 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-1`}>
                                クラフト
                                <IoHammer size={28} />
                            </h1>
                            <p className={`${subTitleColor} mt-1`}>アイテムを組み合わせて新しいものを作ろう</p>
                        </div>
                    </header>

                    {loading ? (
                        <p className="text-center animate-pulse">読み込み中...</p>
                    ) : (
                        <div className="space-y-4 pb-20">
                            {RECIPES.map((recipe) => {
                                const canCraft = recipe.materials.every(mat => (inventory[mat.itemName] || 0) >= mat.count);
                                const resultDetail = itemDetails[recipe.resultItemName];

                                return (
                                    <div key={recipe.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-slate-700 text-lg">{recipe.resultItemName}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                                            {/* 素材リスト */}
                                            {recipe.materials.map((mat, idx) => {
                                                const hasEnough = (inventory[mat.itemName] || 0) >= mat.count;
                                                const matDetail = itemDetails[mat.itemName];
                                                return (
                                                    <div key={idx} className="flex flex-col items-center justify-between bg-white/50 rounded-xl p-2 w-20 h-24 flex-shrink-0">
                                                        <div className="flex-grow flex items-center justify-center">
                                                            {/* ★修正: アイコン名がGiGhostならTeruTeruIconを表示 */}
                                                            {matDetail?.iconName === 'GiGhost' ? (
                                                                <TeruTeruIcon size={28} />
                                                            ) : (
                                                                <ItemIcon name={matDetail?.iconName} size={28} />
                                                            )}
                                                        </div>
                                                        <div className="w-full flex flex-col items-center">
                                                            <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">{mat.itemName}</span>
                                                            <span className={`text-xs font-bold ${hasEnough ? 'text-slate-700' : 'text-red-500'}`}>
                                                                {inventory[mat.itemName] || 0}/{mat.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <IoArrowForward className="text-slate-400 min-w-[20px]" />

                                            {/* 完成品 */}
                                            <div className="flex flex-col items-center justify-between bg-amber-100/80 rounded-xl p-2 w-20 h-24 border-2 border-amber-200 flex-shrink-0">
                                                <div className="flex-grow flex items-center justify-center">
                                                    {/* ★修正: アイコン名がGiGhostならTeruTeruIconを表示 */}
                                                    {resultDetail?.iconName === 'GiGhost' ? (
                                                        <TeruTeruIcon size={28} />
                                                    ) : (
                                                        <ItemIcon name={resultDetail?.iconName} rarity={resultDetail?.rarity} size={28} />
                                                    )}
                                                </div>
                                                <div className="w-full flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">{recipe.resultItemName}</span>
                                                    <span className="text-xs font-bold text-amber-600">完成</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCraft(recipe)}
                                            disabled={!canCraft || craftingId === recipe.id}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${canCraft
                                                ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600'
                                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {craftingId === recipe.id ? '作成中...' : canCraft ? 'つくる！' : '素材が足りません'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Footer />
            </main>
        </div>
    );
}