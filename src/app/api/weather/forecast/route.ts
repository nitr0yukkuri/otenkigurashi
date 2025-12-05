// src/app/api/weather/forecast/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get('lat');
    const lonRaw = searchParams.get('lon');

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ message: 'APIキーが設定されていません。' }, { status: 500 });
    }
    if (!latRaw || !lonRaw) {
        return NextResponse.json({ message: '緯度または経度が指定されていません。' }, { status: 400 });
    }

    // 座標を丸める（キャッシュヒット率向上用だが、今回はno-storeなのでURLの一貫性のため）
    const lat = parseFloat(latRaw).toFixed(2);
    const lon = parseFloat(lonRaw).toFixed(2);

    // ★★★ 修正: 「現在の天気」と「週間予報」の両方のURLを用意 ★★★
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        // ★★★ 修正: 両方のデータを並行して取得（キャッシュなし） ★★★
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherApiUrl, { cache: 'no-store' }),
            fetch(forecastApiUrl, { cache: 'no-store' })
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            // 片方でも失敗したらエラー詳細を確認
            const errorData = !weatherRes.ok ? await weatherRes.json() : await forecastRes.json();
            console.error('OpenWeatherMap API Error:', errorData);
            throw new Error(errorData.message || '天気情報の取得に失敗しました。');
        }

        const currentData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        // ★★★ 修正: フィルタリングを削除 ★★★
        // 以前は過去データを削除していましたが、これだと夜間に当日のデータポイントが足りず
        // 最高/最低気温が同じになる問題があるため、直近の予報枠（例: 21:00など）を含めるようにします。
        // forecastData.list = forecastData.list.filter((item: any) => item.dt > currentData.dt);

        // ★★★ 修正: 「現在の天気」を「予報データの形式」に変換して、リストの先頭に追加する ★★★
        // これにより、「今日の予報」のアイコンや気温が、未来の予測値ではなく「今この瞬間の値」になります。

        const icon = currentData.weather?.[0]?.icon || '01d';
        const pod = icon.includes('n') ? 'n' : 'd';

        // 現在の天気に雨/雪データがあれば、降水確率(pop)を100%(1)とみなす簡易補正
        const hasPrecipitation = currentData.rain || currentData.snow;
        const currentPop = hasPrecipitation ? 1 : 0;

        const currentAsForecastItem = {
            dt: currentData.dt,
            main: currentData.main,
            weather: currentData.weather,
            clouds: currentData.clouds,
            wind: currentData.wind,
            visibility: currentData.visibility,
            pop: currentPop,
            sys: { pod: pod },
            dt_txt: new Date(currentData.dt * 1000).toISOString().replace('T', ' ').substring(0, 19)
        };

        // 先頭に追加（unshift）
        forecastData.list.unshift(currentAsForecastItem);

        return NextResponse.json(forecastData);

    } catch (error: any) {
        console.error('API Route Error:', error.message);
        return NextResponse.json({ message: error.message || '外部APIへのリクエスト中にエラーが発生しました。' }, { status: 500 });
    }
}