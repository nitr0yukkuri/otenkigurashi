// src/app/components/TenChanHomeClient.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Footer from './Footer';
import WeatherDisplay from './WeatherDisplay';
import CharacterDisplay from './CharacterDisplay';
import ConfirmationModal from './ConfirmationModal';
import ItemGetModal from './ItemGetModal';

// ★★★ 変更点: 共通のユーティリティからインポートしてロジックを統一 ★★★
import {
    WeatherType,
    mapWeatherType,
    getTimeOfDay,
    getBackgroundGradientClass
} from '../lib/weatherUtils';

// --- キー定義 ---
const PET_NAME_STORAGE_KEY = 'otenki-gurashi-petName';
const PET_COLOR_STORAGE_KEY = 'otenki-gurashi-petColor';
const PET_EQUIPMENT_KEY = 'otenki-gurashi-petEquipment';
const CURRENT_WEATHER_KEY = 'currentWeather';
const PET_SETTINGS_CHANGED_EVENT = 'petSettingsChanged';

// --- 会話メッセージ (変更なし) ---
const conversationMessages = {
    sunny: ["おひさまが気持ちいいね！", "こんな日はおさんぽしたくなるな〜", "あったかいね〜！", "ぽかぽかするね", "おせんたくびよりだ！", "まぶしいな〜！"],
    clear: ["雲ひとつないね！", "空がとっても青いよ！", "どこまでも見えそう！", "すがすがしい気分！", "飛行機雲が見えるかも？", "深呼吸したくなるね〜"],
    cloudy: ["今日は過ごしやすいね！", "雲の形をずっと見ていられるなあ…", "おひさまはどこかな？", "雨、降らないといいな〜", "雲がゆっくり動いてるよ", "日焼けの心配がなくていいね！"],
    rainy: ["雨の音が聞こえるね", "傘は持った？", "あめ、あめ、ふれ、ふれ♪", "かたつむりさん、いるかな？", "しっとりするね", "雨宿りしよっか！"],
    thunderstorm: ["ゴロゴロって音がする…！", "ちょっとだけこわいかも…", "おへそ隠さなきゃ！", "ひゃっ！光った！", "はやくおさまるといいね", "嵐が来てるみたい…！"],
    snowy: ["わー！雪だ！", "雪だるま、作れるかな？", "ふわふわしてるね", "まっしろだね！", "さむいけど、きれい！", "こんこんっ"],
    windy: ["風がびゅーびゅー言ってる！", "帽子が飛ばされそうだ〜", "わわっ！とばされちゃう〜！", "色んなものが飛んでる！", "髪がぐちゃぐちゃだよ〜！", "風ぐるまがよく回りそう！"],
    night: ["今日もおつかれさま", "星が見えるかな？", "そろそろ眠いかも…", "いい夢みてね", "静かだね…", "おやすみなさい…"],
    default: ["こんにちは！", "なになに？", "えへへっ", "今日も元気だよ！", "何か用かな？", "わーい！", "やっほー！", "（なでなでして！）", "今日はどんな日？", "るんるん♪"]
};

// --- メインコンポーネント ---
export default function TenChanHomeClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [weather, setWeather] = useState<WeatherType | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temperature, setTemperature] = useState<number | null>(null);
    const [petName, setPetName] = useState<string>("てんちゃん");
    const [petColor, setPetColor] = useState<string>("white");
    const [petEquipment, setPetEquipment] = useState<string | null>(null);
    const [location, setLocation] = useState<string | null>("場所を取得中...");
    const [isClient, setIsClient] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isItemGetModalOpen, setIsItemGetModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<{ id: number | null; name: string; iconName: string | null; rarity: string | null } | null>(null);

    const timeOfDay = getTimeOfDay(currentTime);

    const setWeatherAndNotify = (newWeather: WeatherType | null) => {
        const weatherValue = newWeather || 'sunny';
        setWeather(weatherValue);
        localStorage.setItem(CURRENT_WEATHER_KEY, weatherValue);
        window.dispatchEvent(new CustomEvent('weatherChanged'));
    };

    const handleCharacterClick = () => {
        if (messageTimeoutRef.current) { clearTimeout(messageTimeoutRef.current); }
        const isNight = timeOfDay === 'night';
        let messageOptions = conversationMessages.default;
        if (isNight) { messageOptions = conversationMessages.night; }
        else if (weather && conversationMessages[weather]) { messageOptions = conversationMessages[weather]; }
        const randomMessage = messageOptions[Math.floor(Math.random() * messageOptions.length)];
        setMessage(randomMessage);
        messageTimeoutRef.current = setTimeout(() => { setMessage(null); }, 2000);
    };

    // デバッグ（おさんぽ）用
    const cycleWeather = () => {
        console.log("Cycling weather");
        setWeather(prev => {
            const weathers: WeatherType[] = ["sunny", "clear", "cloudy", "rainy", "thunderstorm", "snowy", "windy", "night"];
            const currentIndex = prev ? weathers.indexOf(prev) : -1;
            const nextWeather = weathers[(currentIndex + 1) % weathers.length];

            console.log("Current weather:", prev, "Next weather:", nextWeather);

            setWeatherAndNotify(nextWeather);
            return nextWeather;
        });
    };

    useEffect(() => {
        setIsClient(true);
        setError(null);
        setIsLoading(true);

        const updatePetSettings = () => {
            const storedName = localStorage.getItem(PET_NAME_STORAGE_KEY);
            if (storedName) {
                setPetName(storedName);
            }
            const storedColor = localStorage.getItem(PET_COLOR_STORAGE_KEY);
            if (storedColor) {
                setPetColor(storedColor);
            }
            const storedEquipment = localStorage.getItem(PET_EQUIPMENT_KEY);
            setPetEquipment(storedEquipment);
        };

        updatePetSettings();

        const handleSettingsChanged = () => {
            updatePetSettings();
        };
        window.addEventListener(PET_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
        window.addEventListener('storage', handleSettingsChanged);

        const fetchWeatherDataByLocation = (latitude: number, longitude: number) => {
            setError(null);
            fetch(`/api/weather/forecast?lat=${latitude}&lon=${longitude}`)
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(errData => {
                            throw new Error(errData.message || `HTTP error! status: ${res.status}`);
                        }).catch(() => {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        });
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data?.list?.[0]?.weather?.[0]?.main || typeof data.list[0].main?.temp !== 'number') {
                        throw new Error('天気データの形式が正しくありません。');
                    }
                    const currentWeather = data.list[0];
                    // ★★★ 修正: 共通の mapWeatherType を使用することで判定基準を統一 ★★★
                    const newWeather = mapWeatherType(currentWeather);
                    setLocation(data.city?.name || "不明な場所");
                    setTemperature(Math.round(currentWeather.main.temp));
                    setWeatherAndNotify(newWeather);
                })
                .catch(err => {
                    console.error("Failed to fetch weather on client:", err);
                    setError(err.message || "お天気情報の取得に失敗しました。");
                    setLocation("取得失敗");
                    setTemperature(null);
                    setWeatherAndNotify(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        };

        if (initialData && initialData.weather) {
            setLocation(initialData.location);
            setTemperature(initialData.temperature);
            setWeatherAndNotify(initialData.weather);
            setIsLoading(false);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeatherDataByLocation(position.coords.latitude, position.coords.longitude);
                    },
                    (geoError) => {
                        console.error("Geolocation Error:", geoError);
                        let errorMessage = "あれれ、いまどこにいるか分かんなくなっちゃった…";
                        if (geoError.code === geoError.PERMISSION_DENIED) {
                            errorMessage = "いまどこにいるか、教えてほしいな！\n（ブラウザの設定を確認してみてね）";
                        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                            errorMessage = "うーん、いまいる場所がうまく掴めないみたい…";
                        } else if (geoError.code === geoError.TIMEOUT) {
                            errorMessage = "場所を探すのに時間がかかっちゃった…\nもう一回試してみて！";
                        }
                        setError(errorMessage);
                        setLocation("？？？");
                        setTemperature(null);
                        setWeatherAndNotify(null);
                        setIsLoading(false);
                    },
                    { timeout: 10000 }
                );
            } else {
                setError("ごめんね、このアプリだと\nいまどこにいるかの機能が使えないみたい…");
                setLocation("？？？");
                setTemperature(null);
                setWeatherAndNotify(null);
                setIsLoading(false);
            }
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        return () => {
            clearInterval(timer);
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            window.removeEventListener(PET_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
            window.removeEventListener('storage', handleSettingsChanged);
        };
    }, [initialData]);

    const handleConfirmWalk = () => {
        setIsModalOpen(false);
        const walkWeather = weather || 'sunny';
        // ★★★ 変更点: location も URL パラメータに追加する (エンコードしておく) ★★★
        const walkLocation = location && location !== "場所を取得中..." && location !== "取得失敗"
            ? location
            : "どこかの場所";

        router.push(`/walk?weather=${walkWeather}&location=${encodeURIComponent(walkLocation)}`);
    };

    const displayWeatherType = weather || 'sunny';
    // ★★★ 修正: 共通の getBackgroundGradientClass を使用 ★★★
    const dynamicBackgroundClass = getBackgroundGradientClass(displayWeatherType);
    const isNight = displayWeatherType === 'night';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <ItemGetModal
                isOpen={isItemGetModalOpen}
                onClose={() => setIsItemGetModalOpen(false)}
                itemName={newItem?.name || null}
                iconName={newItem?.iconName || null}
                rarity={newItem?.rarity || null}
            />

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmWalk}
                type="walk"
            >
                <h2 className="text-2xl font-bold text-gray-800 whitespace-pre-line">
                    {"おさんぽは1日\n3回しかできません\n大丈夫ですか？"}
                </h2>
            </ConfirmationModal>

            <main
                className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-[#5D4037]'} ${dynamicBackgroundClass} transition-all duration-500`}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl"></div>

                <WeatherDisplay
                    weather={isLoading || error ? null : displayWeatherType}
                    timeOfDay={timeOfDay}
                    isClient={isClient}
                    currentTime={currentTime}
                    temperature={temperature}
                    location={isLoading ? "取得中..." : (error ? "？？？" : location)}
                    onCycleWeather={cycleWeather}
                />

                {error && (
                    <p className="text-center text-sm text-red-600 bg-red-100 p-2 mx-4 rounded -mt-4 mb-2 shadow-sm whitespace-pre-line">
                        {error}
                    </p>
                )}

                {isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-y-4 p-3 text-center pb-20">
                        <div className="w-40 h-40 flex items-center justify-center">
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-slate-500 animate-pulse">てんちゃん じゅんびちゅう...</h1>
                        </div>
                    </div>
                ) : (
                    <CharacterDisplay
                        petName={petName}
                        petColor={petColor}
                        petEquipment={petEquipment}
                        mood={error ? "sad" : "happy"}
                        message={message}
                        onCharacterClick={handleCharacterClick}
                        isNight={isNight}
                    />
                )}

                <Footer onWalkClick={() => setIsModalOpen(true)} />
            </main>
        </div>
    );
}