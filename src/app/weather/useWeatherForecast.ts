// src/app/weather/useWeatherForecast.ts

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WeatherType, mapWeatherType, getBackgroundGradientClass } from '../lib/weatherUtils';

export interface Forecast {
    day: string;
    date: string;
    weather: string;
    high: number;
    low: number;
    pop: number;
}
interface DailyData {
    temps: number[];
    pops: number[];
    weathers: string[];
    items: any[];
}

const getWeatherText = (weatherType: string): string => {
    switch (weatherType) {
        case 'partlyCloudy': return '晴れ時々くもり';
        case 'cloudy': return 'くもり';
        case 'clear': return '快晴';
        case 'sunny': return '晴れ';
        case 'rainy': return '雨';
        case 'snowy': return '雪';
        case 'night': return '夜';
        case 'windy': return '強風';
        case 'thunderstorm': return '雷雨';
        default: return '晴れ';
    }
};

const generateAdviceMessage = (data: { day: string; weather: string; high: number; low: number; pop: number }, index: number): string => {
    const { day, weather, high, low, pop } = data;
    const weatherText = getWeatherText(weather);
    let messages: string[] = [];

    if (weather === 'night') {
        messages = [
            `こんばんは！${day}は最高${high}°C、最低${low}°Cだったみたいだね。`,
            `${day}もおつかれさま！ゆっくり休んでね。`,
            `もう夜だね。${day}の気温は最高${high}°C、最低${low}°Cだったよ。`,
        ];
    } else if (weather === 'rainy') {
        messages = [
            `☔ ${day}は雨が降るみたい！傘を忘れないでね。`,
            `💧 降水確率は${pop}%だよ。今日はお気に入りのレイングッズを用意しよう！`,
            `🌧️ ${day}は雨模様...。濡れないように気をつけてね。`,
        ];
    } else if (high >= 25) {
        messages = [
            `🥵 ${day}は${high}°Cまで上がるよ！半袖のほうがいいかも。`,
            `☀️ 暑い一日になりそう！水分補給を忘れずにね。`,
            `💦 ${day}はとっても暑くなるよ。熱中症には気をつけて。`,
        ];
    } else if (low <= 5) {
        messages = [
            `🥶 ${day}は${low}°Cまで下がるよ...。しっかり防寒してね。`,
            `❄️ 寒い日が続きそうだね。温かい飲み物を飲んで体を冷やさないように！`,
            `🌬️ ${day}は冷え込む予報だよ。マフラーや手袋が必要かも。`,
        ];
    } else if (weather === 'windy') {
        messages = [
            `🍃 ${day}は風が強いみたい！帽子が飛ばされないように気をつけて。`,
            `🌬️ ${day}の天気は${weatherText}だよ。洗濯物が飛ばされちゃうかも！`,
        ];
    } else if (weather === 'thunderstorm') {
        messages = [
            `⚡ ${day}は雷雨の予報だよ。ゴロゴロ鳴ったら建物に避難してね。`,
            `⛈️ ${day}の天気は${weatherText}！おへそ隠さなきゃ！`,
        ];
    } else {
        messages = [
            `${day}の天気は${weatherText}だよ。最高${high}°C、最低${low}°C。`,
            `${day}の予報は${weatherText}だね。穏やかな一日になりますように。`,
            `今日（${day}）の天気予報は、${weatherText}！`,
        ];
    }
    const selectedIndex = index % messages.length;
    return messages[selectedIndex];
};

export function useWeatherForecast() {
    const [location, setLocation] = useState('位置情報を取得中...');
    const [forecast, setForecast] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDayMessage, setSelectedDayMessage] = useState<string | null>(null);
    const [messageIndex, setMessageIndex] = useState(0);
    const fetchStarted = useRef(false);

    const handleInitialMessage = useCallback((data: Forecast[]) => {
        if (data.length > 0) {
            const todayData = data[0];
            const initialMessage = generateAdviceMessage(todayData, 0);
            setSelectedDayMessage(initialMessage);
            setMessageIndex(1);
        }
    }, []);

    const handleCardClick = useCallback((data: Forecast) => {
        const message = generateAdviceMessage(data, messageIndex);
        setSelectedDayMessage(message);
        setMessageIndex(prevIndex => (prevIndex + 1));
    }, [messageIndex]);

    useEffect(() => {
        if (fetchStarted.current) return;
        fetchStarted.current = true;

        const fetchWeatherData = async (latitude: number, longitude: number) => {
            setError(null);
            try {
                // ★修正1: 明示的に摂氏(metric)をリクエスト
                const forecastResponse = await fetch(`/api/weather/forecast?lat=${latitude}&lon=${longitude}&units=metric`);
                const data = await forecastResponse.json();
                if (!forecastResponse.ok) throw new Error(data.message || '予報の取得に失敗しました');
                setLocation(data.city.name || "不明な場所");

                const dailyForecasts = new Map<string, DailyData>();
                data.list.forEach((item: any) => {
                    const d = new Date(item.dt * 1000);

                    // ★修正2: 手動でJSTに変換して日付キーを生成 (ブラウザ依存回避)
                    const jstTime = new Date(d.getTime() + 9 * 60 * 60 * 1000);
                    const dateKey = `${jstTime.getUTCFullYear()}-${String(jstTime.getUTCMonth() + 1).padStart(2, '0')}-${String(jstTime.getUTCDate()).padStart(2, '0')}`;

                    if (!dailyForecasts.has(dateKey)) {
                        dailyForecasts.set(dateKey, { temps: [], pops: [], weathers: [], items: [] });
                    }
                    const dayData = dailyForecasts.get(dateKey)!;

                    // ★修正3: 温度の安全策 (万が一ケルビンで返ってきても補正)
                    let temp = item.main.temp;
                    if (temp > 200) {
                        temp = temp - 273.15;
                    }
                    dayData.temps.push(temp);

                    dayData.pops.push(item.pop);
                    dayData.weathers.push(item.weather[0].main);
                    dayData.items.push(item);
                });

                const formattedForecast = Array.from(dailyForecasts.entries()).slice(0, 5).map(([dateKey, dailyData], index) => {
                    const [y, m, d] = dateKey.split('-').map(Number);
                    const date = new Date(y, m - 1, d);

                    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                    let dayLabel = index === 0 ? '今日' : index === 1 ? '明日' : `${date.getMonth() + 1}/${date.getDate()}`;

                    let representativeItem = dailyData.items[0];

                    // ★修正4: アイコン選択ロジックを修正 (index 0の「今日」も含めて昼間のデータを優先)
                    const daytimeItem = dailyData.items.find((item: any) => {
                        const h = (new Date(item.dt * 1000).getUTCHours() + 9) % 24;
                        return h >= 10 && h <= 14;
                    });
                    if (daytimeItem) {
                        representativeItem = daytimeItem;
                    } else {
                        const anyDaytimeItem = dailyData.items.find((item: any) => {
                            const h = (new Date(item.dt * 1000).getUTCHours() + 9) % 24;
                            return h >= 6 && h <= 18;
                        });
                        if (anyDaytimeItem) representativeItem = anyDaytimeItem;
                    }

                    if (!representativeItem) representativeItem = { weather: [{ main: "Clear" }] };

                    let weather: WeatherType | string = mapWeatherType(representativeItem);

                    return {
                        day: dayLabel, date: dayOfWeek, weather: weather,
                        high: Math.round(Math.max(...dailyData.temps)),
                        low: Math.round(Math.min(...dailyData.temps)),
                        pop: Math.round(Math.max(...dailyData.pops) * 100),
                    };
                });

                setForecast(formattedForecast);
                handleInitialMessage(formattedForecast);
            } catch (err: any) {
                console.error("Failed to fetch weather forecast:", err);
                setError(err.message);
                setLocation("天気情報の取得に失敗");
                setSelectedDayMessage("あれれ、うまくお天気を調べられなかったみたい...");
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude),
                (geoError) => {
                    console.error("Geolocation Error:", geoError);
                    // 位置情報が取得できない場合は大阪を表示
                    console.log("Using fallback location (Osaka).");
                    fetchWeatherData(34.6937, 135.5023);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            // 位置情報がサポートされていない場合も大阪を表示
            console.log("Geolocation not supported. Using fallback location.");
            fetchWeatherData(34.6937, 135.5023);
        }
    }, [handleInitialMessage]);

    const todayWeather = useMemo(() => (forecast.length > 0 ? forecast[0].weather as WeatherType : null), [forecast]);
    const dynamicBackgroundClass = useMemo(() => getBackgroundGradientClass(todayWeather), [todayWeather]);
    const isNight = useMemo(() => todayWeather === 'night', [todayWeather]);

    return {
        location,
        forecast,
        loading,
        error,
        selectedDayMessage,
        handleCardClick,
        dynamicBackgroundClass,
        isNight,
    };
}