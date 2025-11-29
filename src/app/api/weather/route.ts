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

    // ★★★ 修正: Forecast(予報) API も取得して降水確率(pop)を取得する ★★★
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

    try {
        // 並行してリクエスト
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherApiUrl, { cache: 'no-store' }),
            fetch(forecastApiUrl, { cache: 'no-store' })
        ]);

        if (!weatherRes.ok) {
            const data = await weatherRes.json();
            console.error('OpenWeatherMap API Error:', data);
            return NextResponse.json({ message: data.message || '天気情報の取得に失敗しました。' }, { status: weatherRes.status });
        }

        const currentData = await weatherRes.json();

        // Forecast APIから降水確率(pop)を取得
        let pop = 0;
        if (forecastRes.ok) {
            const forecastData = await forecastRes.json();
            // リストの先頭（現在に最も近い予報）のpopを使用
            if (forecastData.list && forecastData.list.length > 0) {
                pop = forecastData.list[0].pop;
            }
        }

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
                    pop: pop, // ★ 修正: 取得したpopを使用（値は0〜1）
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