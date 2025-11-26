// src/app/weather/useWeatherForecast.ts

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// 共通の型定義とヘルパー関数をインポート
import { WeatherType, mapWeatherType, getTimeOfDay, getBackgroundGradientClass } from '../lib/weatherUtils';

// ===================================
// 1. このフック固有の型定義
// ===================================
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
    // ★ 3時間ごとの item データを保持する配列を追加
    items: any[];
}

// ===================================
// ★ ヘルパー関数群 (フックの外)
// ===================================

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
    } else if (pop >= 50) {
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


// ===================================
// 3. カスタムフック本体
// ===================================
export function useWeatherForecast() {
    // --- State定義 ---
    const [location, setLocation] = useState('位置情報を取得中...');
    const [forecast, setForecast] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDayMessage, setSelectedDayMessage] = useState<string | null>(null);
    const [messageIndex, setMessageIndex] = useState(0);
    const fetchStarted = useRef(false);

    // --- メッセージとカードクリックのハンドラ ---
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

    // --- データ取得ロジック (useEffect) ---
    useEffect(() => {
        if (fetchStarted.current) return;
        fetchStarted.current = true;

        const fetchWeatherData = async (latitude: number, longitude: number) => {
            setError(null);
            try {
                const forecastResponse = await fetch(`/api/weather/forecast?lat=${latitude}&lon=${longitude}`);
                const data = await forecastResponse.json();
                if (!forecastResponse.ok) throw new Error(data.message || '予報の取得に失敗しました');
                setLocation(data.city.name || "不明な場所");

                // 週間予報データの整形
                const dailyForecasts = new Map<string, DailyData>();
                data.list.forEach((item: any) => {
                    const date = new Date(item.dt * 1000).toLocaleDateString('ja-JP');
                    if (!dailyForecasts.has(date)) {
                        dailyForecasts.set(date, { temps: [], pops: [], weathers: [], items: [] });
                    }
                    const dayData = dailyForecasts.get(date)!;
                    dayData.temps.push(item.main.temp);
                    dayData.pops.push(item.pop);
                    dayData.weathers.push(item.weather[0].main);
                    dayData.items.push(item);
                });

                const formattedForecast = Array.from(dailyForecasts.entries()).slice(0, 5).map(([dateStr, dailyData], index) => {
                    const date = new Date(dateStr);
                    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
                    let dayLabel = index === 0 ? '今日' : index === 1 ? '明日' : `${date.getMonth() + 1}/${date.getDate()}`;

                    // ★ 代表的なアイテムの選定
                    // デフォルトは最初のデータ（0時など）
                    let representativeItem = dailyData.items[0];

                    // 明日以降(index > 0)の場合は、日中(10時〜14時くらい)のデータを優先して代表にする
                    if (index > 0) {
                        const daytimeItem = dailyData.items.find((item: any) => {
                            const h = new Date(item.dt * 1000).getHours();
                            return h >= 10 && h <= 14;
                        });
                        if (daytimeItem) {
                            representativeItem = daytimeItem;
                        } else {
                            // 10-14時がない場合のフォールバック（念のため日中全体）
                            const anyDaytimeItem = dailyData.items.find((item: any) => {
                                const h = new Date(item.dt * 1000).getHours();
                                return h >= 6 && h <= 18;
                            });
                            if (anyDaytimeItem) representativeItem = anyDaytimeItem;
                        }
                    }

                    if (!representativeItem) representativeItem = { weather: [{ main: "Clear" }] };

                    // ★ 修正: hasRainロジックを削除し、代表アイテムの天気をそのまま採用する
                    // これにより「今日」は現在天気、明日以降は日中の天気が表示される
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

        // Geolocationロジック
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude),
                (geoError) => {
                    console.error("Geolocation Error:", geoError);
                    let errorMessage = "あれれ、いまどこにいるか分かんなくなっちゃった…";
                    let message = "いまどこにいるか分かれば、お天気を調べられるよ！";

                    if (geoError.code === geoError.PERMISSION_DENIED) {
                        errorMessage = "いまどこにいるか、教えてほしいな！\n（ブラウザの設定を確認してみてね）";
                        message = "いまどこにいるか教えてくれたら、お天気予報をお届けするね。";
                    } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                        errorMessage = "うーん、いまいる場所がうまく掴めないみたい…";
                        message = "うまく場所が掴めないみたい…。もう一度試してみてね。";
                    } else if (geoError.code === geoError.TIMEOUT) {
                        errorMessage = "場所を探すのに時間がかかっちゃった…\nもう一回試してみて！";
                        message = "場所を探すのに時間がかかっちゃったみたい。";
                    }

                    setLocation("？？？");
                    setError(errorMessage);
                    setLoading(false);
                    setSelectedDayMessage(message);
                },
                { timeout: 10000 }
            );
        } else {
            setLocation("？？？");
            setError("ごめんね、このアプリだと\nいまどこにいるかの機能が使えないみたい…");
            setLoading(false);
            setSelectedDayMessage("うーん、このアプリだと場所がわからないみたい…");
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