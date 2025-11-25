'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mapWeatherType, getBackgroundColorClass } from './utils';

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

    const dynamicBackgroundClass = useMemo(() => getBackgroundColorClass(weather || undefined), [weather]);
    const isNight = useMemo(() => weather === 'night', [weather]);

    useEffect(() => {
        if (hasStartedProcessing.current || isProcessing) return;

        const debugWeather = searchParams.get('weather');
        const paramLocation = searchParams.get('location');

        const obtainItem = (currentWeather: string) => {
            if (hasStartedProcessing.current) return;
            hasStartedProcessing.current = true;
            setIsProcessing(true);

            setTimeout(async () => {
                try {
                    const itemResponse = await fetch('/api/items/obtain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ weather: currentWeather }),
                    });
                    const itemResult = await itemResponse.json();
                    if (!itemResponse.ok) {
                        throw new Error(itemResult.message || 'アイテム獲得に失敗しました');
                    }
                    const item = itemResult;

                    setObtainedItem({ id: item.id, name: item.name, iconName: item.iconName, rarity: item.rarity });
                    setIsItemModalOpen(true);

                    const collectionResponse = await fetch('/api/collection', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemId: item.id }),
                    });
                    if (!collectionResponse.ok) {
                        const collectionError = await collectionResponse.json();
                        console.error("コレクション記録失敗:", collectionError.message);
                    }

                    const walkCompleteResponse = await fetch('/api/walk/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ weather: currentWeather }),
                    });
                    if (!walkCompleteResponse.ok) {
                        const walkError = await walkCompleteResponse.json();
                        console.error("おさんぽ回数記録失敗:", walkError.message);
                    }

                } catch (err: any) {
                    console.error("アイテム取得または記録処理中にエラー:", err);
                    setError(err.message || 'アイテム処理中にエラーが発生しました');
                    setObtainedItem({ id: null, name: 'ふしぎな石', iconName: 'IoHelpCircle', rarity: 'normal' });
                    setIsItemModalOpen(true);

                    try {
                        await fetch('/api/walk/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ weather: currentWeather }),
                        });
                    } catch (e) {
                        console.error('フォールバックのおさんぽ回数記録にも失敗', e);
                    }

                } finally {
                    setLoading(false);
                }
            }, 3000);
        };

        if (debugWeather) {
            setWeather(debugWeather);

            if (paramLocation) {
                setLocation(decodeURIComponent(paramLocation));
            } else if (navigator.geolocation) {
                setLocation("現在地を確認中...");
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        fetch(`/api/weather/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
                            .then(res => res.json())
                            .then(data => {
                                setLocation(data.city?.name || "どこかの場所");
                            })
                            .catch(() => setLocation("どこかの場所"));
                    },
                    () => setLocation("どこかの場所")
                );
            } else {
                setLocation("どこかの場所");
            }

            setLoading(false);
            obtainItem(debugWeather);
            return;
        }

        const fetchCurrentWeather = (lat: number, lon: number) => {
            if (hasStartedProcessing.current) return;

            fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(errData => {
                            throw new Error(errData.message || `HTTP error! status: ${res.status}`);
                        });
                    }
                    return res.json();
                })
                .then(data => {
                    if (hasStartedProcessing.current) return;
                    if (!data.list) throw new Error(data.message || '天気情報が取得できませんでした');
                    setLocation(data.city.name || "不明な場所");
                    const current = data.list[0];
                    const realWeather = mapWeatherType(current);
                    setWeather(realWeather);
                    obtainItem(realWeather);
                })
                .catch(err => {
                    if (hasStartedProcessing.current) return;
                    console.error("天気情報の取得に失敗:", err);
                    setError(err.message || "天気情報の取得に失敗しました。");
                    setLocation("天気取得失敗");
                    setLoading(false);
                    hasStartedProcessing.current = true;
                    setIsProcessing(false);
                });
        };

        if (navigator.geolocation) {
            if (!hasStartedProcessing.current) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => fetchCurrentWeather(pos.coords.latitude, pos.coords.longitude),
                    (geoError) => {
                        if (hasStartedProcessing.current) return;
                        console.error("位置情報の取得に失敗:", geoError);
                        setError("位置情報の取得を許可してください。");
                        setLocation("位置情報取得失敗");
                        setLoading(false);
                        hasStartedProcessing.current = true;
                        setIsProcessing(false);
                    }
                );
            }
        } else {
            if (!hasStartedProcessing.current) {
                setError("このブラウザでは位置情報機能が利用できません。");
                setLocation("位置情報取得不可");
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