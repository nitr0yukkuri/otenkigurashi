// src/app/walk/utils.ts
// ★★★ 重要: ファイル名を uitls.ts から utils.ts に修正しました ★★★

export const mapWeatherType = (weatherData: any): string => {
    // Check if weatherData and necessary nested properaties exist
    if (!weatherData || !weatherData.weather || weatherData.weather.length === 0 || !weatherData.wind) {
        console.warn('Incomplete weather data received in mapWeatherType:', weatherData);
        return "sunny"; // Return a default value
    }
    const main = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind.speed;

    const hour = new Date().getHours();
    const isNight = hour < 5 || hour >= 19;

    if (windSpeed >= 10) return "windy";
    if (main.includes("thunderstorm")) return "thunderstorm";
    if (main.includes("rain") || main.includes("drizzle")) return "rainy";
    if (main.includes("snow")) return "snowy";

    if (main.includes("clear")) {
        return isNight ? "night" : "clear";
    }
    if (main.includes("clouds")) {
        const cloudiness = weatherData.clouds?.all;
        if (cloudiness !== undefined && cloudiness > 75) {
            return isNight ? "night" : "cloudy";
        }
        return isNight ? "night" : "sunny";
    }

    return isNight ? "night" : "sunny";
};

export const getBackgroundColorClass = (weatherType?: string): string => {
    switch (weatherType) {
        case 'clear': return 'bg-clear';
        case 'sunny': return 'bg-sunny';
        case 'rainy': return 'bg-rainy';
        case 'cloudy': return 'bg-cloudy';
        case 'snowy': return 'bg-snowy';
        case 'thunderstorm': return 'bg-thunderstorm';
        case 'windy': return 'bg-windy';
        case 'night': return 'bg-night';
        default: return 'bg-sky-200';
    }
};

export const getWalkMessage = (weatherType?: string): string => {
    switch (weatherType) {
        case 'sunny': return '太陽が気持ちいいね！何が見つかるかな？';
        case 'clear': return '雲ひとつない快晴だ！遠くまで見えるよ！';
        case 'rainy': return '雨だけど、特別な出会いがあるかも！しずくの音がきれい。';
        case 'cloudy': return 'くもりの日は、のんびりおさんぽにぴったり。';
        case 'snowy': return '雪だ！足跡をつけて歩こう！ふわふわ！';
        case 'thunderstorm': return 'すごい音！ちょっと怖いけど、珍しいものが見つかるかも？急いで探そう！';
        case 'windy': return '風が強いね！飛ばされないように気をつけて！';
        case 'night': return '夜のおさんぽは静かでいいね。星がきれい。';
        default: return 'てくてく…何が見つかるかな？';
    }
}