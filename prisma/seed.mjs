// prisma/seed.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialItems = [
    // --- 既存のアイテム ---
    { name: 'ひまわりのタネ', description: '太陽が好きな花のタネ。晴れた日に見つかる。', rarity: 'normal', iconName: 'IoSunny', weather: 'sunny' },
    { name: 'たいようのいし', description: '持っていると心がポカポカする不思議な石。', rarity: 'rare', iconName: 'BsSunFill', weather: 'clear' },
    { name: 'あじさい', description: '雨の日にきれいに咲く花。', rarity: 'normal', iconName: 'IoRainy', weather: 'rainy' },
    { name: 'かたつむり', description: '雨が好きな、のんびりやさん。', rarity: 'rare', iconName: 'GiSnail', weather: 'rainy' },
    { name: 'かみなりのいし', description: 'バリバリとすごい力を秘めている石。', rarity: 'rare', iconName: 'IoThunderstorm', weather: 'thunderstorm' },
    { name: 'わたぐも', description: '空にうかぶ雲のかけら。くもりの日に手に入る。', rarity: 'normal', iconName: 'IoCloudy', weather: 'cloudy' },
    { name: '雪の結晶', description: 'キラキラと輝く、冬のたからもの。', rarity: 'normal', iconName: 'IoSnow', weather: 'snowy' },
    { name: 'ほしのかけら', description: '夜空から落ちてきた、小さな光。', rarity: 'rare', iconName: 'FaStar', weather: 'night' },
    { name: 'かぜぐるま', description: '風の力でくるくる回るおもちゃ。', rarity: 'normal', iconName: 'GiWhirlwind', weather: 'windy' },
    { name: 'まいごのこけし', description: 'あれ？こんなところにこけしが…。持ち主を探しているのかな？', rarity: 'rare', iconName: 'IoBodyOutline', weather: null },

    // --- ▼▼▼ 新しく追加するアイテム (30個) ▼▼▼ ---

    // 【いつでも見つかるかも？ (weather: null)】
    { name: 'きれいな小石', description: '道ばたで見つけた、すべすべしたきれいな石。', rarity: 'normal', iconName: 'GiStoneBlock', weather: null },
    { name: 'どんぐり', description: 'コロコロと丸い、木の実。帽子をかぶっているみたい。', rarity: 'normal', iconName: 'GiAcorn', weather: null },
    { name: 'なくしたボタン', description: '誰かが落としていったのかな？ちょっと古そうなボタン。', rarity: 'normal', iconName: 'BsRecordCircle', weather: null },
    { name: 'ふつうの葉っぱ', description: '特になんでもない、どこにでもある葉っぱ。', rarity: 'normal', iconName: 'FaLeaf', weather: null },
    { name: '小枝', description: 'ポキッと折れた小さな木の枝。', rarity: 'normal', iconName: 'GiStickSplinter', weather: null },
    { name: 'たんぽぽの綿毛', description: '風に乗って飛んできたふわふわの綿毛。', rarity: 'normal', iconName: 'FaFeatherAlt', weather: null },
    { name: 'ビー玉', description: 'キラキラ光るガラス玉。誰かが落としたのかな？', rarity: 'uncommon', iconName: 'BsRecordCircleFill', weather: null },
    { name: '鳥の羽根', description: 'ふわりと舞い落ちてきた、きれいな羽根。', rarity: 'uncommon', iconName: 'FaFeather', weather: null },
    { name: 'シーグラス', description: '波にもまれて丸くなったガラスのかけら。', rarity: 'uncommon', iconName: 'GiSeaDragon', weather: null }, // アイコン候補変更
    { name: '四つ葉のクローバー', description: '見つけるとラッキーなことがあるらしい。', rarity: 'rare', iconName: 'GiClover', weather: null },
    { name: 'ちいさなカギ', description: 'とても小さい古いカギ。何を開けるんだろう？', rarity: 'rare', iconName: 'FaKey', weather: null },
    { name: '時のかけら', description: '時の流れを感じさせる、不思議な輝きを持つかけら。', rarity: 'legendary', iconName: 'GiSandsOfTime', weather: null },

    // 【晴れ (sunny) の日】
    { name: '日向の石', description: 'おひさまを浴びてぽかぽか温かい石。', rarity: 'normal', iconName: 'GiStonePile', weather: 'sunny' },
    { name: '蝶々の抜け殻', description: '蝶々が旅立った後の殻。', rarity: 'uncommon', iconName: 'GiButterfly', weather: 'sunny' },

    // 【快晴 (clear) の日】
    { name: '青空のかけら', description: '澄み切った空の色を映したような石。', rarity: 'uncommon', iconName: 'BsGem', weather: 'clear' },
    { name: '飛行機雲のなごり', description: '空に残った飛行機雲の、ほんの一部。', rarity: 'rare', iconName: 'IoPaperPlaneOutline', weather: 'clear' },

    // 【雨 (rainy) の日】
    { name: '雨粒のしずく', description: '雨粒が固まってできたような、きれいなしずく。', rarity: 'uncommon', iconName: 'IoWaterOutline', weather: 'rainy' },
    { name: '虹のかけら', description: '雨上がりの空から落ちてきた虹の一部。', rarity: 'epic', iconName: 'GiRainbowStar', weather: 'rainy' }, // 雨の日限定に変更

    // 【くもり (cloudy) の日】
    { name: '曇りガラス', description: 'すりガラスのような、向こうがぼんやり見えるかけら。', rarity: 'normal', iconName: 'BsSquareHalf', weather: 'cloudy' },
    { name: '霧吹き草', description: '霧のような細かい水滴をつけた草。', rarity: 'uncommon', iconName: 'GiGrass', weather: 'cloudy' },

    // 【雪 (snowy) の日】
    { name: '小さな雪うさぎ', description: '誰かが作ったのかな？手のひらサイズの雪うさぎ。', rarity: 'uncommon', iconName: 'FaSnowflake', weather: 'snowy' }, // アイコン候補変更
    { name: '氷の欠片', description: 'キラキラと光る、氷の小さなかけら。', rarity: 'normal', iconName: 'FaRegSnowflake', weather: 'snowy' },
    { name: 'つららドロップ', description: 'つららの先から落ちた、氷のしずく。', rarity: 'rare', iconName: 'GiIceCube', weather: 'snowy' },

    // 【雷雨 (thunderstorm) の日】
    { name: 'バリバリの実', description: '雷の日にだけなる、食べるとパチパチする不思議な実。', rarity: 'epic', iconName: 'GiElectric', weather: 'thunderstorm' },
    { name: 'お天気お守り', description: '嵐から守ってくれるかもしれない、古びたお守り。', rarity: 'rare', iconName: 'GiPaperLantern', weather: 'thunderstorm' },

    // 【強風 (windy) の日】
    { name: '風の音', description: '風の音が閉じ込められたような、不思議な貝殻。', rarity: 'uncommon', iconName: 'GiSpiralShell', weather: 'windy' },
    { name: '飛ばされた帽子', description: '風で飛ばされてきた、誰かの小さな帽子。', rarity: 'normal', iconName: 'FaHatCowboy', weather: 'windy' },

    // 【夜 (night) の日】
    { name: '月のしずく', description: '月の光が集まってできたような、優しい光の玉。', rarity: 'epic', iconName: 'BsMoonStarsFill', weather: 'night' },
    { name: '真夜中の花', description: '夜にだけそっと咲く、珍しい花。', rarity: 'rare', iconName: 'GiNightSky', weather: 'night' }, // アイコン候補変更
    { name: '眠りの砂', description: '持っていると少し眠たくなる、キラキラした砂。', rarity: 'uncommon', iconName: 'GiSparkles', weather: 'night' },
    // --- ▲▲▲ 追加ここまで ▲▲▲ ---
];

async function main() {
    console.log('Seeding started...');
    // ★ データを初期化せず、upsertで更新するように変更
    for (const item of initialItems) {
        await prisma.item.upsert({
            where: { name: item.name },
            update: item,
            create: item,
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });