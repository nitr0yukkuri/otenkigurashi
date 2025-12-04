'use client';

import WeatherIcon from './WeatherIcon';

interface Forecast {
    day: string;
    date: string;
    weather: string;
    high: number;
    low: number;
    pop: number;
}

interface ForecastCardProps {
    day: string;
    date: string;
    weather: string;
    high: number;
    low: number;
    pop: number;
    onClick: (data: Forecast) => void;
    isNight?: boolean;
}

export default function ForecastCard({ day, date, weather, high, low, pop, onClick, isNight = false }: ForecastCardProps) {
    const getWeatherText = (weatherType: string) => {
        switch (weatherType) {
            case 'partlyCloudy': return '晴れ時々くもり';
            case 'cloudy': return 'くもり';
            case 'sunny': return '晴れ';
            case 'rainy': return '雨';
            case 'snowy': return '雪';
            case 'night': return '夜';
            case 'windy': return '強風';
            case 'thunderstorm': return '雷雨';
            default: return '晴れ';
        }
    };

    const cardData = { day, date, weather, high, low, pop };

    const titleColor = isNight ? 'text-gray-100' : 'text-slate-700';
    const dateColor = isNight ? 'text-gray-300' : 'text-slate-500';
    const weatherTextColor = isNight ? 'text-gray-200' : 'text-slate-600';
    const highTempColor = isNight ? 'text-white' : 'text-slate-800';
    const lowTempColor = isNight ? 'text-gray-400' : 'text-slate-400';
    const popColor = isNight ? 'text-cyan-300' : 'text-cyan-600';
    const bgClass = isNight ? 'bg-white/20 hover:bg-white/30' : 'bg-white/40 hover:bg-white/60';

    return (
        <button
            onClick={() => onClick(cardData)}
            className={`flex-shrink-0 w-32 text-center p-4 ${bgClass} backdrop-blur-md rounded-[2rem] shadow-lg flex flex-col items-center transition-transform active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400`}
        >
            <p className={`font-bold ${titleColor}`}>{day}</p>
            {/* ▼▼▼ 修正: font-extrabold に変更してさらに太く ▼▼▼ */}
            <p className={`text-sm font-extrabold ${dateColor} -mt-1`}>{date}</p>

            <div className="my-3">
                <WeatherIcon type={weather} size={40} />
            </div>

            <p className={`text-xs font-semibold ${weatherTextColor} h-8 flex items-center justify-center`}>
                {getWeatherText(weather)}
            </p>

            <div className="text-lg">
                <span className={`font-bold ${highTempColor}`}>{high}°</span>
                <span className={`text-sm ${lowTempColor}`}>/{low}°</span>
            </div>

            <p className={`text-xs font-bold mt-2 ${popColor}`}>{pop}%</p>
        </button>
    );
}