// src/app/components/TenChanHomeClient.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Footer from './Footer';
import WeatherDisplay from './WeatherDisplay';
import CharacterDisplay, { EquipmentState } from './CharacterDisplay';
import ConfirmationModal from './ConfirmationModal';
import ItemGetModal from './ItemGetModal';
import HelpButton from './HelpButton';
import HelpModal from './HelpModal';
import { getUserId } from '../lib/userId';

import {
    WeatherType,
    mapWeatherType,
    getTimeOfDay,
    getBackgroundGradientClass
} from '../lib/weatherUtils';

const PET_NAME_STORAGE_KEY = 'otenki-gurashi-petName';
const PET_COLOR_STORAGE_KEY = 'otenki-gurashi-petColor';
const PET_CHEEK_COLOR_STORAGE_KEY = 'otenki-gurashi-petCheekColor';
const PET_EQUIPMENT_KEY = 'otenki-gurashi-petEquipment';
const CURRENT_WEATHER_KEY = 'currentWeather';
const PET_SETTINGS_CHANGED_EVENT = 'petSettingsChanged';

const conversationMessages: { [key: string]: string[] } = {
    sunny: ["おひさまが気持ちいいね！", "こんな日はおさんぽしたくなるな〜", "あったかいね〜！", "ぽかぽかするね"],
    clear: ["雲ひとつないね！", "空がとっても青いよ！", "どこまでも見えそう！", "すがすがしい気分！"],
    cloudy: ["今日は過ごしやすいね！", "雲の形をずっと見ていられるなあ…", "おひさまはどこかな？"],
    rainy: ["雨の音が聞こえるね", "傘は持った？", "あめ、あめ、ふれ、ふれ♪", "しっとりするね"],
    thunderstorm: ["ゴロゴロって音がする…！", "ちょっとだけこわいかも…", "おへそ隠さなきゃ！"],
    snowy: ["わー！雪だ！", "雪だるま、作れるかな？", "ふわふわしてるね", "まっしろだね！"],
    windy: ["風がびゅーびゅー言ってる！", "帽子が飛ばされそうだ〜", "わわっ！とばされちゃう〜！"],
    night: ["今日もおつかれさま", "星が見えるかな？", "そろそろ眠いかも…", "いい夢みてね"],
    default: ["こんにちは！", "なになに？", "えへへっ", "今日も元気だよ！", "何か用かな？"]
};

export default function TenChanHomeClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [weather, setWeather] = useState<WeatherType | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temperature, setTemperature] = useState<number | null>(null);
    const [petName, setPetName] = useState("てんちゃん");
    const [petColor, setPetColor] = useState("white");
    const [petCheekColor, setPetCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null });
    const [location, setLocation] = useState<string | null>("場所を取得中...");
    const [isClient, setIsClient] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [consecutiveDays, setConsecutiveDays] = useState<number>(0);

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

    const cycleWeather = () => {
        setWeather(prev => {
            const weathers: WeatherType[] = ["sunny", "clear", "cloudy", "rainy", "thunderstorm", "snowy", "windy", "night"];
            const currentIndex = prev ? weathers.indexOf(prev) : -1;
            const nextWeather = weathers[(currentIndex + 1) % weathers.length];
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
            if (storedName) setPetName(storedName);
            const storedColor = localStorage.getItem(PET_COLOR_STORAGE_KEY);
            if (storedColor) setPetColor(storedColor);
            const storedCheekColor = localStorage.getItem(PET_CHEEK_COLOR_STORAGE_KEY);
            if (storedCheekColor) setPetCheekColor(storedCheekColor);
            const storedEquipment = localStorage.getItem(PET_EQUIPMENT_KEY);
            if (storedEquipment) {
                try {
                    const parsed = JSON.parse(storedEquipment);
                    if (typeof parsed === 'string') {
                        setPetEquipment({ head: parsed, hand: null, floating: null });
                    } else {
                        setPetEquipment(parsed);
                    }
                } catch {
                    setPetEquipment({ head: storedEquipment, hand: null, floating: null });
                }
            } else {
                setPetEquipment({ head: null, hand: null, floating: null });
            }
        };

        updatePetSettings();

        const fetchUserProgress = async () => {
            const userId = getUserId();
            if (!userId) return;
            try {
                const res = await fetch(`/api/progress?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setConsecutiveDays(data.consecutiveWalkDays || 0);
                }
            } catch (e) {
                console.error("Failed to fetch progress", e);
            }
        };
        fetchUserProgress();

        const handleSettingsChanged = () => updatePetSettings();
        window.addEventListener(PET_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
        window.addEventListener('storage', handleSettingsChanged);

        const fetchWeatherDataByLocation = (latitude: number, longitude: number) => {
            setError(null);
            fetch(`/api/weather/forecast?lat=${latitude}&lon=${longitude}`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    if (!data?.list?.[0]) throw new Error('天気データの形式が正しくありません。');
                    const currentWeather = data.list[0];
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
                .finally(() => setIsLoading(false));
        };

        if (initialData && initialData.weather) {
            setLocation(initialData.location);
            setTemperature(initialData.temperature);
            setWeatherAndNotify(initialData.weather);
            setIsLoading(false);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => fetchWeatherDataByLocation(position.coords.latitude, position.coords.longitude),
                    (geoError) => {
                        console.error("Geolocation Error:", geoError);
                        setError("位置情報の取得に失敗しました。");
                        setLocation("？？？");
                        setIsLoading(false);
                    },
                    { timeout: 10000 }
                );
            } else {
                setError("このブラウザでは位置情報が使えません。");
                setLocation("？？？");
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
        const walkLocation = location && location !== "場所を取得中..." && location !== "取得失敗" ? location : "どこかの場所";
        router.push(`/walk?weather=${walkWeather}&location=${encodeURIComponent(walkLocation)}`);
    };

    const displayWeatherType = weather || 'sunny';
    const dynamicBackgroundClass = getBackgroundGradientClass(displayWeatherType);
    const isNight = displayWeatherType === 'night';

    return (
        <div className="w-full min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <ItemGetModal isOpen={false} onClose={() => { }} itemName={null} iconName={null} rarity={null} />
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmWalk} type="walk">
                <h2 className="text-2xl font-bold text-gray-800 whitespace-pre-line">
                    {"おさんぽは1日\n3回しかできません\n大丈夫ですか？"}
                </h2>
            </ConfirmationModal>
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

            <main className={`w-full max-w-sm h-[640px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-[#5D4037]'} ${dynamicBackgroundClass} transition-all duration-500`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl"></div>
                <HelpButton onClick={() => setIsHelpOpen(true)} />

                <WeatherDisplay
                    weather={isLoading || error ? null : displayWeatherType}
                    timeOfDay={timeOfDay}
                    isClient={isClient}
                    currentTime={currentTime}
                    temperature={temperature}
                    location={isLoading ? "取得中..." : (error ? "？？？" : location)}
                    onCycleWeather={cycleWeather}
                />

                {consecutiveDays > 0 && !isLoading && (
                    <div className="absolute top-20 left-4 bg-white/40 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        連続 {consecutiveDays} 日目
                    </div>
                )}

                {error && <p className="text-center text-sm text-red-600 bg-red-100 p-2 mx-4 rounded mb-2">{error}</p>}

                {isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-y-4 p-3 text-center pb-20">
                        <div className="w-40 h-40 flex items-center justify-center"></div>
                        <div><h1 className="text-xl font-medium text-slate-500 animate-pulse">{petName} じゅんびちゅう...</h1></div>
                    </div>
                ) : (
                    <CharacterDisplay
                        petName={petName}
                        petColor={petColor}
                        cheekColor={petCheekColor}
                        equipment={petEquipment}
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