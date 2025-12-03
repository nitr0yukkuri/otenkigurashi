// src/app/lib/weatherUtils.ts
'use client';

// 共通関数を移植・統合

export type WeatherType = "sunny" | "clear" | "rainy" | "cloudy" | "snowy" | "thunderstorm" | "windy" | "night";

/**
 * OpenWeatherMapのデータから天気タイプをマッピングします。
 * (TenChanHomeClient.tsx, page.tsx7, weather/page.tsx から共通化)
 */
export const mapWeatherType = (weatherData: any): WeatherType => {
    if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
        return "sunny";
    }
    const main = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind?.speed;

    // ★ 修正案: 時間(getHours)ではなく、OpenWeatherMapが返してくれる「昼夜フラグ(pod)」を優先する
    let isNight = false;

    // APIデータの sys.pod が 'n' (night) なら夜とする
    if (weatherData.sys && weatherData.sys.pod === 'n') {
        isNight = true;
    } else if (weatherData.sys && weatherData.sys.pod === 'd') {
        isNight = false;
    } else {
        // データがない場合のフォールバック（ここだけ時間は使うが、APIデータがあれば通らない）
        const hour = new Date().getHours();
        isNight = hour < 5 || hour >= 19;
    }

    if (windSpeed !== undefined && windSpeed >= 8.5) return "windy";
    if (main.includes("thunderstorm")) return "thunderstorm";
    if (main.includes("rain") || main.includes("drizzle")) return "rainy";
    if (main.includes("snow")) return "snowy";

    if (main.includes("clear")) {
        return isNight ? "night" : "clear";
    }
    if (main.includes("clouds")) {
        const cloudiness = weatherData.clouds?.all;
        // ★★★ 修正: 閾値を 75 -> 50 に変更し、くもり判定を緩和 ★★★
        if (cloudiness !== undefined && cloudiness > 50) {
            return isNight ? "night" : "cloudy";
        }
        return isNight ? "night" : "sunny"; // 雲が少ない場合は晴れ扱い
    }

    return isNight ? "night" : "sunny";
};

/**
 * 天気タイプに応じた背景グラデーションのCSSクラスを返します。
 * (TenChanHomeClient.tsx, collection/page.tsx, settings/page.tsx から共通化)
 */
export const getBackgroundGradientClass = (weather: WeatherType | null): string => {
    switch (weather) {
        case 'clear': return 'bg-clear';
        case 'cloudy': return 'bg-cloudy';
        case 'rainy': return 'bg-rainy';
        case 'thunderstorm': return 'bg-thunderstorm';
        case 'snowy': return 'bg-snowy';
        case 'windy': return 'bg-windy';
        case 'night': return 'bg-night';
        case 'sunny':
        default: return 'bg-sunny';
    }
};

/**
 * 現在時刻から "morning", "afternoon", "evening", "night" を返します。
 * (TenChanHomeClient.tsx, weather/page.tsx から共通化)
 */
export const getTimeOfDay = (date: Date): "morning" | "afternoon" | "evening" | "night" => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 19) return "evening";
    return "night";
};