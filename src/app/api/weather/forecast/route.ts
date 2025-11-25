import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get('lat'); // 変数名を変更
    const lonRaw = searchParams.get('lon'); // 変数名を変更

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ message: 'APIキーが設定されていません。' }, { status: 500 });
    }
    if (!latRaw || !lonRaw) {
        return NextResponse.json({ message: '緯度または経度が指定されていません。' }, { status: 400 });
    }

    // ★★★ 修正ポイント: 座標を小数点第2位（約1km圏内）で丸める ★★★
    // これにより、GPSの微細なブレ（誤差）があっても同じURLとして認識させ、
    // キャッシュをヒットさせることで天候の不一致を防ぎます。
    const lat = parseFloat(latRaw).toFixed(2);
    const lon = parseFloat(lonRaw).toFixed(2);
    // ★★★ 修正ここまで ★★★

    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        // ★★★ 変更点: キャッシュを無効化 ({ cache: 'no-store' }) ★★★
        // 時間が空いた際に古い情報が表示されるのを防ぐため、常に最新を取得します
        const response = await fetch(forecastApiUrl, { cache: 'no-store' });

        // レスポンスがOKでない場合、エラー内容を詳しく調査する
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenWeatherMap API Error Response:', errorData);
            throw new Error(errorData.message || '週間天気予報の取得に失敗しました。');
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        // エラーメッセージをコンソールに出力
        console.error('API Route Error:', error.message);
        return NextResponse.json({ message: error.message || '外部APIへのリクエスト中にエラーが発生しました。' }, { status: 500 });
    }
}