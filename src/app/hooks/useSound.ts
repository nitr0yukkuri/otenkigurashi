'use client';

import { useCallback } from 'react';
import { STORAGE_KEYS } from '../settings/constants';

export const useSound = () => {
    const playSfx = useCallback((fileName: string) => {
        // ローカルストレージから音量設定を取得 (デフォルトは50%)
        const storedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME_SFX);

        // ★★★ 修正: 音量計算をより安全に (NaN対策と範囲制限) ★★★
        let volume = 0.5; // デフォルト値
        if (storedVolume) {
            const parsed = parseInt(storedVolume, 10);
            if (!isNaN(parsed)) {
                // 0〜100の範囲に収めてから0.0〜1.0に変換
                volume = Math.max(0, Math.min(100, parsed)) / 100;
            }
        }

        // 音量が0以下の場合は再生しない
        if (volume <= 0) return;

        try {
            // 音声ファイルを再生
            const audio = new Audio(`/sounds/${fileName}`);
            audio.volume = volume;
            // 再生開始
            audio.play().catch((e) => {
                console.error("再生エラー:", e);
                // ユーザーインタラクションがない状態での自動再生などでエラーになる場合があります
            });
        } catch (error) {
            console.error("Audio生成エラー:", error);
        }
    }, []);

    return { playSfx };
};