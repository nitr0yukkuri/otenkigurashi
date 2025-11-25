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

    // 座標の丸め（キャッシュヒット率向上用）
    const lat = parseFloat(latRaw).toFixed(2);
    const lon = parseFloat(lonRaw).toFixed(2);

    // ★★★ 修正: Forecast(予報)ではなく、Weather(現在)のAPIを使用 ★★★
    // これによりリアルタイムな観測データを取得でき、精度が大幅に向上します。
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        const response = await fetch(weatherApiUrl, { cache: 'no-store' });

        if (!response.ok) {
            const data = await response.json();
            console.error('OpenWeatherMap API Error:', data);
            return NextResponse.json({ message: data.message || '天気情報の取得に失敗しました。' }, { status: response.status });
        }

        const currentData = await response.json();

        // ★★★ データ整形（アダプター処理） ★★★
        // フロントエンドは "list[0]" の形式（Forecast APIの構造）を期待しているため、
        // 現在の天気データを Forecast API のレスポンス形式に擬態させて返します。
        // これにより、フロントエンドのコードを変更せずに精度だけを修正できます。

        // アイコン名から昼夜(d/n)を判定 (例: "01n" -> "n")
        const icon = currentData.weather?.[0]?.icon || '01d';
        const pod = icon.includes('n') ? 'n' : 'd';

        const formattedData = {
            // Forecast APIのように "list" 配列の中にデータを入れる
            list: [
                {
                    dt: currentData.dt,
                    main: currentData.main,
                    weather: currentData.weather,
                    clouds: currentData.clouds,
                    wind: currentData.wind,
                    visibility: currentData.visibility,
                    pop: 0, // 降水確率は現在天気にはないので0
                    sys: {
                        pod: pod // 昼夜判定を渡す
                    },
                    dt_txt: new Date(currentData.dt * 1000).toISOString().replace('T', ' ').substring(0, 19) // フォーマット調整
                }
            ],
            // 都市情報はルートではなくcityオブジェクトに入れる (Forecast API互換)
            city: {
                id: currentData.id,
                name: currentData.name,
                coord: currentData.coord,
                country: currentData.sys.country,
                sunrise: currentData.sys.sunrise,
                sunset: currentData.sys.sunset,
                timezone: currentData.timezone
            }
        };

        return NextResponse.json(formattedData);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ message: 'サーバー内部でエラーが発生しました。' }, { status: 500 });
    }
}