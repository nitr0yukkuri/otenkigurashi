// src/app/craft/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoHammer, IoArrowBack } from 'react-icons/io5';
import Footer from '../components/Footer';
import ItemIcon from '../components/ItemIcon';
import { getUserId } from '../lib/userId';
import { RECIPES, Recipe } from '../lib/recipes';
import { getBackgroundGradientClass, WeatherType } from '../lib/weatherUtils';

type InventoryMap = { [itemName: string]: number };
// ★追加: アイテムの詳細情報（アイコンなど）を保持する型
type ItemDetailsMap = { [itemName: string]: { iconName: string | null, rarity: string } };

const STORAGE_KEYS = {
    CURRENT_WEATHER: 'currentWeather',
};

export default function CraftPage() {
    const [inventory, setInventory] = useState<InventoryMap>({});
    // ★追加: アイテム詳細のState
    const [itemDetails, setItemDetails] = useState<ItemDetailsMap>({});
    const [loading, setLoading] = useState(true);
    const [craftingId, setCraftingId] = useState<string | null>(null);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    // ★追加: 天気・背景色State
    const [dynamicBackgroundClass, setDynamicBackgroundClass] = useState('bg-sunny');
    const [isNight, setIsNight] = useState(false);

    // ★追加: 天気情報の読み込み
    useEffect(() => {
        const storedWeather = localStorage.getItem(STORAGE_KEYS.CURRENT_WEATHER) as WeatherType | null;
        setDynamicBackgroundClass(getBackgroundGradientClass(storedWeather));
        setIsNight(storedWeather === 'night');
    }, []);

    const fetchInventory = async () => {
        try {
            const userId = getUserId();
            const res = await fetch(`/api/collection?userId=${userId}`);
            const data = await res.json();
            const map: InventoryMap = {};
            const details: ItemDetailsMap = {}; // ★追加
            data.forEach((item: any) => {
                map[item.name] = item.quantity;
                // ★追加: アイテム名からアイコン情報を引けるようにする
                details[item.name] = { iconName: item.iconName, rarity: item.rarity };
            });
            setInventory(map);
            setItemDetails(details);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleCraft = async (recipe: Recipe) => {
        setCraftingId(recipe.id);
        setResultMessage(null);
        try {
            const userId = getUserId();
            const res = await fetch('/api/craft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId: recipe.id, userId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setResultMessage(`${recipe.resultItemName} を作成しました！`);
            await fetchInventory();
        } catch (error: any) {
            setResultMessage(error.message || '作成に失敗しました');
        } finally {
            setCraftingId(null);
        }
    };

    const isCraftable = (recipe: Recipe) => {
        return recipe.materials.every(mat => (inventory[mat.itemName] || 0) >= mat.count);
    };

    // ★追加: 文字色と戻るボタンのスタイル調整
    const textColor = isNight ? 'text-white' : 'text-slate-700';
    const subTitleColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const backButtonClass = isNight
        ? 'bg-black/20 text-gray-200 hover:bg-black/40'
        : 'bg-white/40 text-slate-700 hover:bg-white/60';

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${textColor} ${dynamicBackgroundClass} transition-all duration-500`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl z-10"></div>

                <div className="flex-grow overflow-y-auto p-6 pb-24">
                    <header className="mb-6">
                        {/* ★修正: 戻るボタンのスタイル適用 */}
                        <Link href="/collection" className={`inline-flex items-center gap-1 text-sm font-bold mb-4 px-4 py-2 rounded-full backdrop-blur-md shadow-sm transition-all ${backButtonClass}`}>
                            <IoArrowBack /> ずかんへ戻る
                        </Link>
                        <h1 className={`text-3xl font-extrabold flex items-center gap-2 ${isNight ? 'text-white' : 'text-slate-800'}`}>
                            <IoHammer className="text-amber-500" />
                            クラフト
                        </h1>
                        <p className={`${subTitleColor} text-sm mt-1`}>素材を集めてアイテムを作ろう</p>
                    </header>

                    {resultMessage && (
                        <div className="mb-6 p-3 bg-white rounded-xl shadow-sm border-2 border-amber-200 text-center font-bold text-amber-700 animate-fade-in-up">
                            {resultMessage}
                        </div>
                    )}

                    <div className="space-y-4">
                        {RECIPES.map((recipe) => {
                            const canCraft = isCraftable(recipe);
                            // ★追加: 成果物の詳細情報を取得
                            const resultItemDetail = itemDetails[recipe.resultItemName];

                            return (
                                <div key={recipe.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                            {/* ★修正: 正しいアイコンとレアリティを表示 */}
                                            <ItemIcon
                                                name={resultItemDetail?.iconName || null}
                                                rarity={resultItemDetail?.rarity || 'normal'}
                                                size={24}
                                            />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">{recipe.resultItemName}</h3>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 mb-3">
                                        <p className="text-xs text-slate-400 font-bold mb-2">ひつような素材</p>
                                        <div className="flex gap-4">
                                            {recipe.materials.map((mat, idx) => {
                                                const has = inventory[mat.itemName] || 0;
                                                const isEnough = has >= mat.count;
                                                return (
                                                    <div key={idx} className="flex flex-col items-center">
                                                        <div className={`text-xs font-bold ${isEnough ? 'text-slate-700' : 'text-red-500'}`}>
                                                            {mat.itemName}
                                                        </div>
                                                        <div className={`text-sm ${isEnough ? 'text-slate-500' : 'text-red-400'}`}>
                                                            {has}/{mat.count}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCraft(recipe)}
                                        disabled={!canCraft || craftingId === recipe.id}
                                        className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${canCraft
                                            ? 'bg-amber-500 text-white shadow-md hover:bg-amber-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {craftingId === recipe.id ? '作成中...' : 'つくる！'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}