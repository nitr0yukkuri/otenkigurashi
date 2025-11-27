// src/app/walk/useWalkLogic.ts

'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mapWeatherType, getBackgroundColorClass } from './utils';
import { getUserId } from '../lib/userId';

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
            if (hasStartedProcessing.current) return;
            hasStartedProcessing.current = true;
            setIsProcessing(true);

            setTimeout(async () => {
                if (!isMounted.current) return;

                try {
                    const userId = getUserId();

                    // アイテム抽選
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

                    // おさんぽ完了記録
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
            setWeather(debugWeather);
            if (paramLocation) setLocation(decodeURIComponent(paramLocation));
            setLoading(false);
            obtainItem(debugWeather);
            return;
        }

        const fetchCurrentWeather = (lat: number, lon: number) => {
            if (hasStartedProcessing.current) return;
            fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)
                .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
                .then(data => {
                    if (!isMounted.current) return;
                    if (hasStartedProcessing.current) return;
                    if (!data.list) throw new Error('天気情報が取得できませんでした');
                    setLocation(data.city.name || "不明な場所");
                    const current = data.list[0];
                    const realWeather = mapWeatherType(current);
                    setWeather(realWeather);
                    obtainItem(realWeather);
                })
                .catch(err => {
                    if (!isMounted.current) return;
                    if (hasStartedProcessing.current) return;
                    console.error(err);
                    setError("天気情報の取得に失敗しました。");
                    setLoading(false);
                    hasStartedProcessing.current = true;
                    setIsProcessing(false);
                });
        };

        if (navigator.geolocation) {
            if (!hasStartedProcessing.current) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => fetchCurrentWeather(pos.coords.latitude, pos.coords.longitude),
                    (err) => {
                        if (!isMounted.current) return;
                        if (hasStartedProcessing.current) return;
                        console.error(err);
                        setError("位置情報の取得を許可してください。");
                        setLoading(false);
                        hasStartedProcessing.current = true;
                        setIsProcessing(false);
                    }
                );
            }
        } else {
            if (!hasStartedProcessing.current) {
                setError("このブラウザでは位置情報機能が利用できません。");
                setLoading(false);
                hasStartedProcessing.current = true;
                setIsProcessing(false);
            }
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
    };
}