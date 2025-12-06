// src/app/walk/useWalkLogic.ts

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mapWeatherType, getBackgroundColorClass } from './utils';
import { getUserId } from '@/app/lib/userId';

interface Item {
    id: number;
    name: string;
    rarity: string;
    iconName: string | null;
}

type ObtainedItem = {
    id: number | null;
    name: string | null;
    iconName: string | null;
    rarity: string | null;
};

export function useWalkLogic() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [weather, setWeather] = useState<string | null>(null);
    const [location, setLocation] = useState('...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [obtainedItem, setObtainedItem] = useState<ObtainedItem>({ id: null, name: null, iconName: null, rarity: null });
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const hasStartedProcessing = useRef(false);
    const isMounted = useRef(true);

    const dynamicBackgroundClass = useMemo(() => getBackgroundColorClass(weather || undefined), [weather]);
    const isNight = useMemo(() => weather === 'night', [weather]);

    // ★追加: ステージIDを取得
    const stage = searchParams.get('stage') || 'default';

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (hasStartedProcessing.current || isProcessing) return;

        const debugWeather = searchParams.get('weather');
        const paramLocation = searchParams.get('location');

        const obtainItem = (currentWeather: string) => {
            setIsProcessing(true);

            setTimeout(async () => {
                if (!isMounted.current) return;

                try {
                    const userId = getUserId();

                    const itemResponse = await fetch('/api/items/obtain', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ weather: currentWeather, userId }),
                    });
                    const itemResult = await itemResponse.json();
                    if (!itemResponse.ok) {
                        throw new Error(itemResult.message || 'アイテム獲得に失敗しました');
                    }
                    const item = itemResult;

                    if (isMounted.current) {
                        setObtainedItem({ id: item.id, name: item.name, iconName: item.iconName, rarity: item.rarity });
                        setIsItemModalOpen(true);
                    }

                    const walkCompleteResponse = await fetch('/api/walk/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ weather: currentWeather, userId }),
                    });
                    if (!walkCompleteResponse.ok) {
                        console.error("おさんぽ回数記録失敗");
                    }

                } catch (err: any) {
                    console.error("アイテム取得または記録処理中にエラー:", err);
                    if (isMounted.current) {
                        setError(err.message || 'アイテム処理中にエラーが発生しました');
                        setObtainedItem({ id: null, name: 'ふしぎな石', iconName: 'IoHelpCircle', rarity: 'normal' });
                        setIsItemModalOpen(true);
                    }
                } finally {
                    if (isMounted.current) {
                        setLoading(false);
                    }
                }
            }, 2000);
        };

        if (debugWeather) {
            hasStartedProcessing.current = true;
            setWeather(debugWeather);
            if (paramLocation) setLocation(decodeURIComponent(paramLocation));
            setLoading(false);
            obtainItem(debugWeather);
            return;
        }

        const fetchCurrentWeather = (lat: number, lon: number) => {
            fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)
                .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
                .then(data => {
                    if (!isMounted.current) return;
                    if (!data.list) throw new Error('天気情報が取得できませんでした');
                    setLocation(data.city.name || "不明な場所");
                    const current = data.list[0];
                    const realWeather = mapWeatherType(current);
                    setWeather(realWeather);
                    obtainItem(realWeather);
                })
                .catch(err => {
                    if (!isMounted.current) return;
                    console.error(err);
                    setError("天気情報の取得に失敗しました。");
                    setLoading(false);
                    setIsProcessing(false);
                });
        };

        if (navigator.geolocation) {
            hasStartedProcessing.current = true;
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchCurrentWeather(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    if (!isMounted.current) return;
                    console.error(err);
                    // ★修正: 致命的なバグ対策 (デモ用フォールバック)
                    // GPS取得失敗時、エラー画面で止まるのを防ぐため、東京の座標で続行する
                    console.log("Using fallback location (Tokyo) for walk demo.");
                    fetchCurrentWeather(35.6895, 139.6917);
                },
                // ★修正: タイムアウトを4秒に短縮
                { timeout: 4000 }
            );
        } else {
            hasStartedProcessing.current = true;
            // ★修正: 非対応環境でも東京の座標で続行
            console.log("Geolocation not supported. Using fallback location.");
            fetchCurrentWeather(35.6895, 139.6917);
        }
    }, [searchParams, isProcessing]);

    const handleModalClose = () => {
        setIsItemModalOpen(false);
        router.push('/');
    };

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
        // ★追加: stageを返す
        stage
    };
}