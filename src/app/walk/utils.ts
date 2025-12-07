// src/app/walk/utils.ts
// ★★★ 重要: 共通の weatherUtils からインポートするように変更 ★★★

import { mapWeatherType, getBackgroundGradientClass } from '../lib/weatherUtils';

// mapWeatherType は共通のものを使用
export { mapWeatherType };

// getBackgroundColorClass という名前で getBackgroundGradientClass をエクスポート（互換性のため）
export const getBackgroundColorClass = (weatherType?: string): string => {
    return getBackgroundGradientClass(weatherType as any);
};

// ★追加: メッセージのバリエーション定義
const walkMessages: { [key: string]: string[] } = {
    sunny: [
        '太陽が気持ちいいね！何が見つかるかな？',
        'ぽかぽかしてて、お昼寝したくなっちゃうな〜。',
        '今日は影ふみして遊ぼうか？',
        'おひさまの匂いがするね！'
    ],
    clear: [
        '雲ひとつない快晴だ！遠くまで見えるよ！',
        '空がとっても青いよ！深呼吸してみよう！',
        '飛行機雲、みつかるかな？',
        'どこまでも歩いていけそうな気分！'
    ],
    rainy: [
        '雨だけど、特別な出会いがあるかも！しずくの音がきれい。',
        'ピチピチ、チャプチャプ、ランランラン♪',
        '水たまりに空が映ってるよ！',
        'カエルさんたちは喜んでるかな？'
    ],
    cloudy: [
        'くもりの日は、のんびりおさんぽにぴったり。',
        '暑くも寒くもなくて、歩きやすいね。',
        'あの雲、おいしそうな形に見えない？',
        '紫外線も少ないし、ゆっくり探索しよう！'
    ],
    snowy: [
        '雪だ！足跡をつけて歩こう！ふわふわ！',
        '雪だるま作ろうよ！',
        '手袋しないと手が冷たいね〜。',
        '真っ白な世界、きれいだねぇ。'
    ],
    thunderstorm: [
        'すごい音！ちょっと怖いけど、珍しいものが見つかるかも？急いで探そう！',
        'ピカッて光った！おへそ隠して！',
        '雨に濡れないように、急いでおさんぽしよっ！',
        '雷様におへそ取られないようにね…！'
    ],
    windy: [
        '風が強いね！飛ばされないように気をつけて！',
        '雲が流れるのが速いね！',
        '向かい風に負けないぞ〜！えいえいおー！'
    ],
    night: [
        '夜のおさんぽは静かでいいね。星がきれい。',
        'お月様、ついてくるね。',
        '虫の声が聞こえるよ。なんて鳴いてるのかな？',
        '暗いから足元に気をつけてね。'
    ],
    default: [
        'てくてく…何が見つかるかな？',
        '知らない道を行くのってワクワクするね！',
        'ん？今なにか動いたような…？',
        '一緒におさんぽ、楽しいな♪'
    ]
};

export const getWalkMessage = (weatherType?: string): string => {
    // ★修正: ランダムにメッセージを選択して返す
    const type = weatherType && walkMessages[weatherType] ? weatherType : 'default';
    const messages = walkMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

// ★修正: ステージIDに応じて名前を返すように変更
export const getWalkStage = (stageId?: string): string => {
    switch (stageId) {
        case 'sea': return '海辺';
        case 'mountain': return '山道';
        case 'default':
        default: return 'いつもの散歩道';
    }
}