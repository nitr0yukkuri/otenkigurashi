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
import ShareButton from './ShareButton';
import ShareModal from './ShareModal';
import WeatherEffects from './WeatherEffects';
import { useSound } from '../hooks/useSound';

import {
    WeatherType,
    mapWeatherType,
    getTimeOfDay,
    getBackgroundGradientClass
} from '../lib/weatherUtils';

const PET_NAME_STORAGE_KEY = 'otenki-gurashi-petName';
const PET_COLOR_STORAGE_KEY = 'otenki-gurashi-petColor';
const PET_CHEEK_COLOR_KEY = 'otenki-gurashi-petCheekColor';
const PET_EQUIPMENT_KEY = 'otenki-gurashi-petEquipment';
const CURRENT_WEATHER_KEY = 'currentWeather';
const PET_SETTINGS_CHANGED_EVENT = 'petSettingsChanged';

const conversationMessages: { [key: string]: string[] } = {
    morning: [
        "おはよう！今日も元気いっぱいだよ！",
        "朝ごはん食べた？今日も一日楽しもうね！",
        "早起きは三文の徳って言うよね！",
        "今日はどんな一日になるかな？",
        "朝日がまぶしいね！",
        "おはよう！いいことありそうな予感♪"
    ],
    afternoon: [
        "こんにちは！おひるだよ〜",
        "午後も頑張ろうね！",
        "おなかすいたね？",
        "ちょっと休憩しない？",
        "おやつの時間かな？",
        "眠くなってきたかも…",
        "今日は何して遊ぶ？"
    ],
    evening: [
        "そろそろ夕方だね",
        "きれいな夕焼けが見えるかな？",
        "カラスが鳴いてるね",
        "おうちに帰ろう〜",
        "今日もお疲れさま！",
        "晩ごはんは何かな？",
        "日が沈むと涼しくなるね"
    ],

    sunny: [
        "おひさまが気持ちいいね！",
        "こんな日はおさんぽしたくなるな〜",
        "あったかいね〜！",
        "ぽかぽかするね",
        "洗濯物がよく乾きそうだね！",
        "日向ぼっこしたいな〜",
        "キラキラしててきれいだね！"
    ],
    clear: [
        "雲ひとつないね！",
        "空がとっても青いよ！",
        "どこまでも見えそう！",
        "すがすがしい気分！",
        "深呼吸すると気持ちいいよ！",
        "遠くの山まで見えるかな？",
        "絶好のおさんぽ日和だね！"
    ],
    cloudy: [
        "今日は過ごしやすいね！",
        "雲の形をずっと見ていられるなあ…",
        "おひさまはどこかな？",
        "雨、降らないといいけど…",
        "なんだか眠たくなっちゃうな",
        "眩しくなくてちょうどいいかも？",
        "雲の上に乗ってみたいな〜"
    ],
    rainy: [
        "雨の音が聞こえるね",
        "傘は持った？",
        "あめ、あめ、ふれ、ふれ♪",
        "しっとりするね",
        "長靴はいてお出かけしたいな",
        "カエルさん、喜んでるかな？",
        "雨の匂いがするね"
    ],
    thunderstorm: [
        "ゴロゴロって音がする…！",
        "ちょっとだけこわいかも…",
        "おへそ隠さなきゃ！",
        "ピカッて光った！",
        "おへそ、ちゃんと隠してね？",
        "早く止まないかなぁ…",
        "きみがいれば怖くないよ！"
    ],
    snowy: [
        "わー！雪だ！",
        "雪だるま、作れるかな？",
        "ふわふわしてるね",
        "まっしろだね！",
        "つらら、できるかな？",
        "足跡つけるのが楽しいね！",
        "寒くてもへっちゃらだよ！"
    ],
    windy: [
        "風がびゅーびゅー言ってる！",
        "飛ばされそうだ〜",
        "わわっ！とばされちゃう〜！",

        "何かが飛んできたよ！",
        "雲が流れるのが速いね！",
        "向かい風に負けないぞ〜！"
    ],
    night: [
        "今日もおつかれさま",
        "星が見えるかな？",
        "明日もいいことあるといいね",
        "夜風が気持ちいいな",
        "月がきれいだね",
        "虫の声が聞こえる？"
    ],
    default: [
        "こんにちは！",
        "なになに？",
        "えへへっ",
        "今日も元気だよ！",
        "何か用かな？",
        "もっとお話ししようよ！",
        "きみのこと、もっと知りたいな"
    ]
};

export default function TenChanHomeClient({ initialData }: { initialData: any }) {
    const router = useRouter();
    const { playSfx } = useSound();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const [weather, setWeather] = useState<WeatherType | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [temperature, setTemperature] = useState<number | null>(null);
    const [petName, setPetName] = useState("てんちゃん");
    const [petColor, setPetColor] = useState("white");
    const [petCheekColor, setPetCheekColor] = useState("#F8BBD0");
    const [petEquipment, setPetEquipment] = useState<EquipmentState>({ head: null, hand: null, floating: null, room: null });
    const [location, setLocation] = useState<string | null>("場所を取得中...");
    const [isClient, setIsClient] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPetting, setIsPetting] = useState(false);
    const rubScoreRef = useRef(0);
    const lastRubTimeRef = useRef(0);
    // 前回のタッチ位置を記録するRef
    const lastXRef = useRef<number | null>(null);

    const [walkStage, setWalkStage] = useState<string>('default');

    const [idleAction, setIdleAction] = useState<'sleepy' | 'looking' | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const timeOfDay = getTimeOfDay(currentTime);

    const resetIdleTimer = () => {
        if (idleAction !== null) setIdleAction(null);
        if (message === "Zzz...") setMessage(null);

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        idleTimerRef.current = setTimeout(() => {
            // ★修正: 夜なら sleepy 固定、それ以外はランダム
            const isNightNow = weather === 'night';

            let nextAction: 'sleepy' | 'looking';
            if (isNightNow) {
                nextAction = 'sleepy';
            } else {
                const actions: ('sleepy' | 'looking')[] = ['sleepy', 'looking'];
                nextAction = actions[Math.floor(Math.random() * actions.length)];
            }

            setIdleAction(nextAction);

            if (nextAction === 'sleepy') {
                setMessage("Zzz...");
            }
        }, 10000);
    };

    useEffect(() => {
        resetIdleTimer();
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, []);

    // ★追加: 天気が変わったらタイマーをリセット（夜になったら寝る判定を有効にするため）
    useEffect(() => {
        if (weather) resetIdleTimer();
    }, [weather]);

    const setWeatherAndNotify = (newWeather: WeatherType | null) => {
        const weatherValue = newWeather || 'sunny';
        setWeather(weatherValue);
        localStorage.setItem(CURRENT_WEATHER_KEY, weatherValue);
        window.dispatchEvent(new CustomEvent('weatherChanged'));
    };

    const handleRubbing = (e: React.PointerEvent<HTMLDivElement>) => {
        resetIdleTimer();

        if (isPetting) return;

        const now = Date.now();
        // 一定時間操作がない場合はリセット
        if (now - lastRubTimeRef.current > 300) {
            rubScoreRef.current = 0;
            lastXRef.current = null; // 位置情報もリセット
        }
        lastRubTimeRef.current = now;

        // movementXを使わず、前回の座標との差分を計算 (スマホ対応)
        const currentX = e.clientX;
        let delta = 0;

        if (lastXRef.current !== null) {
            delta = Math.abs(currentX - lastXRef.current);
        }
        lastXRef.current = currentX;

        rubScoreRef.current += delta;

        if (rubScoreRef.current > 1500) {
            triggerPetting();
            rubScoreRef.current = 0;
            lastXRef.current = null;
        }
    };

    const triggerPetting = () => {
        setIsPetting(true);
        setIdleAction(null);
        if (messageTimeoutRef.current) { clearTimeout(messageTimeoutRef.current); }

        const pettingMessages = [
            "えへへ〜♪\nなでなでうれしいな！",
            "わぁ〜い！\nもっとっもっと〜！",
            "くすぐったいよ〜\nえへへっ♪"
        ];
        const randomMsg = pettingMessages[Math.floor(Math.random() * pettingMessages.length)];

        setMessage(randomMsg);
        playSfx('decision.mp3');

        messageTimeoutRef.current = setTimeout(() => {
            setIsPetting(false);
            setMessage(null);
            resetIdleTimer();
        }, 3000);
    };

    const handleCharacterClick = () => {
        resetIdleTimer();

        if (isPetting) return;

        if (messageTimeoutRef.current) { clearTimeout(messageTimeoutRef.current); }

        let messageOptions: string[] = [];

        if (timeOfDay && conversationMessages[timeOfDay] && (weather === 'sunny' || weather === 'clear')) {
            messageOptions = messageOptions.concat(conversationMessages[timeOfDay]);
        }

        if (weather && conversationMessages[weather]) {
            messageOptions = messageOptions.concat(conversationMessages[weather]);

            if (weather === 'night' && (currentTime.getHours() >= 22 || currentTime.getHours() < 5)) {
                messageOptions.push("そろそろ眠いかも…", "いい夢みてね");
            }
        }

        if (messageOptions.length === 0) {
            messageOptions = conversationMessages.default;
        }

        const randomMessage = messageOptions[Math.floor(Math.random() * messageOptions.length)];
        setMessage(randomMessage);
        messageTimeoutRef.current = setTimeout(() => { setMessage(null); }, 2000);
    };

    const cycleWeather = () => {
        resetIdleTimer();
        const weathers: WeatherType[] = ["sunny", "clear", "cloudy", "rainy", "thunderstorm", "snowy", "windy", "night"];
        const current = weather || 'sunny';
        const currentIndex = weathers.indexOf(current);
        const nextWeather = weathers[(currentIndex + 1) % weathers.length];
        setWeatherAndNotify(nextWeather);
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
            const storedCheekColor = localStorage.getItem(PET_CHEEK_COLOR_KEY);
            if (storedCheekColor) setPetCheekColor(storedCheekColor);
            const storedEquipment = localStorage.getItem(PET_EQUIPMENT_KEY);
            if (storedEquipment) {
                try {
                    const parsed = JSON.parse(storedEquipment);
                    if (typeof parsed === 'string') {
                        setPetEquipment({ head: parsed, hand: null, floating: null, room: null });
                    } else {
                        setPetEquipment({ head: null, hand: null, floating: null, room: null, ...parsed });
                    }
                } catch {
                    setPetEquipment({ head: storedEquipment, hand: null, floating: null, room: null });
                }
            } else {
                setPetEquipment({ head: null, hand: null, floating: null, room: null });
            }
        };

        updatePetSettings();

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
                    // ★修正: エラーメッセージをかわいく
                    setError("あわわ、お天気がわかんないよ〜💦 通信環境をかくにんしてね！");
                    setLocation("？？？");
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
                        // ★修正: 致命的なバグ対策 (デモ用フォールバック)
                        console.log("Using fallback location (Tokyo) for demo.");
                        fetchWeatherDataByLocation(35.6895, 139.6917);
                    },
                    // ★修正: タイムアウトを4秒に短縮 (10000 -> 4000)
                    { timeout: 4000 }
                );
            } else {
                // こちらも同様にフォールバック
                console.log("Geolocation not supported. Using fallback location.");
                fetchWeatherDataByLocation(35.6895, 139.6917);
            }
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => {
            clearInterval(timer);
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            window.removeEventListener(PET_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
            window.removeEventListener('storage', handleSettingsChanged);
        };
    }, [initialData]);

    const handleConfirmWalk = () => {
        resetIdleTimer();
        setIsModalOpen(false);
        const walkWeather = weather || 'sunny';
        const walkLocation = location && location !== "場所を取得中..." && location !== "取得失敗" && location !== "？？？" ? location : "どこかの場所";
        router.push(`/walk?weather=${walkWeather}&location=${encodeURIComponent(walkLocation)}&stage=${walkStage}`);
    };

    const displayWeatherType = weather || 'sunny';
    const dynamicBackgroundClass = getBackgroundGradientClass(displayWeatherType);
    const isNight = displayWeatherType === 'night';

    let currentMood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" = "happy";

    if (isPetting) {
        currentMood = "happy";
    } else if (error) {
        currentMood = "sad";
    } else if (idleAction) {
        currentMood = idleAction;
        // ★修正: 夜なら強制的に寝る（クロージャ問題でlookingが選ばれた場合の補正）
        if (isNight) currentMood = 'sleepy';
    } else if (displayWeatherType === 'thunderstorm') {
        currentMood = message ? "happy" : "scared";
    } else {
        // ★修正: 夜でも最初は起きている（放置すると idleAction で寝る）
        currentMood = "happy";
    }

    return (
        <div className="w-full min-h-screen md:bg-gray-200 md:flex md:items-center md:justify-center md:p-4">
            <ItemGetModal isOpen={false} onClose={() => { }} itemName={null} iconName={null} rarity={null} />
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmWalk} type="walk">
                <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg mb-4 whitespace-pre-line">
                        {"おさんぽは1日\n3回しかできません"}
                    </p>
                    <p className="text-sm text-gray-500 mb-2 font-bold">行き先を選んでね</p>
                    <div className="flex justify-center gap-2 mb-2">
                        {[
                            { id: 'default', label: 'いつもの' },
                            { id: 'sea', label: '海' },
                            { id: 'mountain', label: '山' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setWalkStage(s.id)}
                                className={`px-4 py-2 rounded-full font-bold text-sm transition-all border-2 ${walkStage === s.id
                                    ? 'bg-sky-100 border-sky-400 text-sky-700 shadow-inner'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </ConfirmationModal>
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                petName={petName}
                petColor={petColor}
                cheekColor={petCheekColor}
                equipment={petEquipment}
                weather={displayWeatherType}
                isNight={isNight}
                backgroundClass={dynamicBackgroundClass}
                mood={currentMood}
            />

            <main className={`w-full md:max-w-sm h-[100dvh] md:h-[640px] md:rounded-3xl md:shadow-2xl overflow-hidden relative flex flex-col ${isNight ? 'text-white' : 'text-[#5D4037]'} ${dynamicBackgroundClass} transition-all duration-500`}>
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black/80 rounded-b-xl"></div>

                <WeatherEffects weather={displayWeatherType} />

                <ShareButton onClick={() => setIsShareOpen(true)} />
                <HelpButton onClick={() => setIsHelpOpen(true)} />

                <WeatherDisplay
                    weather={isLoading ? null : displayWeatherType}
                    timeOfDay={timeOfDay}
                    isClient={isClient}
                    currentTime={currentTime}
                    temperature={temperature}
                    location={isLoading ? "取得中..." : (error ? "？？？" : location)}
                    onCycleWeather={cycleWeather}
                />

                {error && <p className="text-center text-sm text-red-600 bg-red-100 p-2 mx-4 rounded mb-2">{error}</p>}

                {isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-y-4 p-3 text-center pb-20">
                        <div className="w-40 h-40 flex items-center justify-center"></div>
                        <div><h1 className="text-xl font-medium text-slate-500 animate-pulse">{petName} じゅんびちゅう...</h1></div>
                    </div>
                ) : (
                    <div
                        className="flex-grow flex flex-col items-center justify-center w-full"
                    >
                        <CharacterDisplay
                            petName={petName}
                            petColor={petColor}
                            cheekColor={petCheekColor}
                            equipment={petEquipment}
                            mood={currentMood}
                            message={message}
                            onCharacterClick={handleCharacterClick}
                            isNight={isNight}
                            weather={displayWeatherType}
                            onPointerMove={handleRubbing}
                            onPointerLeave={() => { rubScoreRef.current = 0; lastXRef.current = null; }}
                        />
                    </div>
                )}
                <Footer onWalkClick={() => setIsModalOpen(true)} />
            </main>
        </div>
    );
}