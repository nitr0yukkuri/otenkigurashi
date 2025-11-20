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

    // ★★★ 修正: 座標を小数点第2位で丸めてキャッシュヒット率を上げる ★★★
    const lat = parseFloat(latRaw).toFixed(2);
    const lon = parseFloat(lonRaw).toFixed(2);

    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        // ★★★ 修正: キャッシュ設定を追加（週間予報APIと合わせる） ★★★
        const response = await fetch(forecastApiUrl, { next: { revalidate: 600 } });

        if (!response.ok) {
            const data = await response.json();
            console.error('OpenWeatherMap API Error:', data);
            return NextResponse.json({ message: data.message || '天気情報の取得に失敗しました。' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ message: 'サーバー内部でエラーが発生しました。' }, { status: 500 });
    }
}