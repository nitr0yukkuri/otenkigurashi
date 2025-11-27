// src/app/api/items/obtain/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// ★★★ レア度ごとの基本の重みを定義 ★★★
const RarityWeight = {
    normal: 100,      // 出やすい
    uncommon: 50,     // やや出にくい
    rare: 25,         // 出にくい
    epic: 10,         // かなり出にくい
    legendary: 1      // めったに出ない
};

export async function POST(request: Request) {
    try {
        // ★ ユーザーIDを取得
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
        }

        const { weather } = await request.json();

        if (!weather) {
            return NextResponse.json({ message: '天候情報が必要です。' }, { status: 400 });
        }

        const allItems = await prisma.item.findMany();

        if (allItems.length === 0) {
            return NextResponse.json({ message: 'アイテムが見つかりません。' }, { status: 404 });
        }

        // --- ▼▼▼ 抽選ロジック ▼▼▼ ---

        const weights = allItems.map(item => {
            // 1. 基本の重みを取得
            let weight = RarityWeight[item.rarity as keyof typeof RarityWeight] ?? RarityWeight.normal;

            // 2. 天候ボーナス
            if (item.weather === weather) {
                if (item.rarity === 'legendary') weight *= 5;
                else if (item.rarity === 'epic') weight *= 4;
                else if (item.rarity === 'rare') weight *= 3;
                else weight *= 2;
            }
            // 3. 天候不一致（いつでも出るアイテム）の調整
            else if (item.weather === null && weather !== null) {
                weight *= 0.8;
            }

            return Math.max(weight, 0.1);
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        if (totalWeight <= 0) {
            // フォールバック
            return NextResponse.json(allItems[0]);
        }

        let randomValue = Math.random() * totalWeight;
        let selectedItem = allItems[allItems.length - 1];

        for (let i = 0; i < allItems.length; i++) {
            randomValue -= weights[i];
            if (randomValue < 0) {
                selectedItem = allItems[i];
                break;
            }
        }

        // --- ▼▼▼ 保存処理（ここを修正・追加） ▼▼▼ ---

        // 1. 既に持っているか確認（新種判定のため）
        const existingInventory = await prisma.userInventory.findUnique({
            where: {
                userId_itemId: {
                    userId: userId,
                    itemId: selectedItem.id,
                },
            },
        });

        // 2. インベントリを更新（所持数を増やす）
        await prisma.userInventory.upsert({
            where: {
                userId_itemId: {
                    userId: userId,
                    itemId: selectedItem.id,
                },
            },
            update: { quantity: { increment: 1 } },
            create: {
                userId: userId,
                itemId: selectedItem.id,
                quantity: 1,
            },
        });

        // 3. 初めて入手したアイテムなら実績（Progress）を更新
        if (!existingInventory) {
            // レアリティごとのフィールド名をマッピング
            const rarityKeyMap: Record<string, string> = {
                normal: 'collectedNormalItemTypesCount',
                uncommon: 'collectedUncommonItemTypesCount',
                rare: 'collectedRareItemTypesCount',
                epic: 'collectedEpicItemTypesCount',
                legendary: 'collectedLegendaryItemTypesCount',
            };

            const targetField = rarityKeyMap[selectedItem.rarity] || 'collectedNormalItemTypesCount';

            // ★ TypeScriptエラーを回避するため、any型としてオブジェクトを作成
            const updateData: any = {
                collectedItemTypesCount: { increment: 1 },
            };
            updateData[targetField] = { increment: 1 };

            const createData: any = {
                userId: userId,
                collectedItemTypesCount: 1,
            };
            createData[targetField] = 1;

            await prisma.userProgress.upsert({
                where: { userId: userId },
                update: updateData,
                create: createData,
            });
        }
        // --- ▲▲▲ 保存処理ここまで ▲▲▲ ---

        return NextResponse.json(selectedItem);

    } catch (error: any) {
        console.error("Failed to obtain item:", error);
        return NextResponse.json({ message: 'アイテムの獲得に失敗しました。' }, { status: 500 });
    }
}