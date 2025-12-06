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

    // 座標を丸める（キャッシュヒット率向上用）
    const lat = parseFloat(latRaw).toFixed(2);
    const lon = parseFloat(lonRaw).toFixed(2);

    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        // ★修正: Forecast APIのみを取得（キャッシュ有効: 30分 = 1800秒）
        const forecastRes = await fetch(forecastApiUrl, { next: { revalidate: 1800 } });

        if (!forecastRes.ok) {
            const errorData = await forecastRes.json();
            console.error('OpenWeatherMap API Error:', errorData);
            throw new Error(errorData.message || '天気情報の取得に失敗しました。');
        }

        const forecastData = await forecastRes.json();

        // ★修正: 現在の天気を無理に追加する処理を削除し、予報データをそのまま返す
        // これにより、不正確な降水確率(pop)や気温の偏りを防ぐ

        return NextResponse.json(forecastData);

    } catch (error: any) {
        console.error('API Route Error:', error.message);
        return NextResponse.json({ message: error.message || '外部APIへのリクエスト中にエラーが発生しました。' }, { status: 500 });
    }
}