// src/app/walk/useWalkLogic.ts

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBackgroundGradientClass, WeatherType } from '../lib/weatherUtils';
import { getUserId } from '../lib/userId';

export const useWalkLogic = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const weatherParam = searchParams.get('weather');
    const locationParam = searchParams.get('location');
    const stageParam = searchParams.get('stage');

    const [weather, setWeather] = useState<string | null>(weatherParam);
    const [location, setLocation] = useState<string | null>(locationParam);
    const [stage, setStage] = useState<string>(stageParam || 'default');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [obtainedItem, setObtainedItem] = useState<{ name: string | null; iconName: string | null; rarity: string | null }>({ name: null, iconName: null, rarity: null });
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    // 2重実行防止用のRef
    const walkStarted = useRef(false);

    useEffect(() => {
        if (weatherParam) setWeather(weatherParam);
        if (locationParam) setLocation(locationParam);
        if (stageParam) setStage(stageParam);

        const performWalk = async () => {
            // すでに開始していたら何もしない（Strict Mode対策）
            if (walkStarted.current) return;
            walkStarted.current = true;

            const userId = getUserId();
            const currentWeather = weatherParam || 'sunny';

            try {
                // 1. おさんぽ完了API (回数更新など)
                await fetch('/api/walk/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, weather: currentWeather })
                });

                // 2. 演出用ウェイト (2秒) - てんちゃんがお散歩している時間
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 3. アイテム獲得API
                const itemRes = await fetch('/api/items/obtain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, weather: currentWeather })
                });

                if (!itemRes.ok) {
                    throw new Error('アイテムが見つかりませんでした');
                }

                const itemData = await itemRes.json();

                setObtainedItem({
                    name: itemData.name,
                    iconName: itemData.iconName,
                    rarity: itemData.rarity
                });
                setIsItemModalOpen(true);

            } catch (err) {
                console.error(err);
                setError('おさんぽ中に迷子になっちゃったみたい…');
            } finally {
                setLoading(false);
            }
        };

        // 初回のみ実行
        if (loading) {
            performWalk();
        }
    }, [weatherParam, locationParam, stageParam, loading]);

    const handleModalClose = () => {
        setIsItemModalOpen(false);
        router.push('/'); // ホームに戻る
    };

    const dynamicBackgroundClass = useMemo(() => getBackgroundGradientClass(weather as WeatherType), [weather]);
    const isNight = weather === 'night';

    return {
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
    };
};