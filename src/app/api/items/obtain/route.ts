// src/app/api/items/obtain/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

const RarityWeight = {
    normal: 100,
    uncommon: 50,
    rare: 25,
    epic: 10,
    legendary: 1
};

export async function POST(request: Request) {
    try {
        const { weather } = await request.json();

        if (!weather) {
            return NextResponse.json({ message: '天候情報が必要です。' }, { status: 400 });
        }

        const allItems = await prisma.item.findMany();

        if (allItems.length === 0) {
            return NextResponse.json({ message: 'アイテムが見つかりません。' }, { status: 404 });
        }

        const weights = allItems.map(item => {
            let weight = RarityWeight[item.rarity as keyof typeof RarityWeight] ?? RarityWeight.normal;
            if (item.weather === weather) {
                if (item.rarity === 'legendary') weight *= 5;
                else if (item.rarity === 'epic') weight *= 4;
                else if (item.rarity === 'rare') weight *= 3;
                else weight *= 2;
            } else if (item.weather === null && weather !== null) {
                weight *= 0.8;
            }
            return Math.max(weight, 0.1);
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (totalWeight <= 0) return NextResponse.json(allItems[0]);

        let randomValue = Math.random() * totalWeight;
        let selectedItem = allItems[allItems.length - 1];

        for (let i = 0; i < allItems.length; i++) {
            randomValue -= weights[i];
            if (randomValue < 0) {
                selectedItem = allItems[i];
                break;
            }
        }

        // 1. 所持確認
        // ★ 型定義のキャッシュ不整合を回避するために as any を使用
        const existingInventory = await prisma.userInventory.findUnique({
            where: {
                itemId: selectedItem.id,
            } as any,
        });

        // 2. インベントリ更新
        // ★ 型定義のキャッシュ不整合を回避するために as any を使用
        await prisma.userInventory.upsert({
            where: {
                itemId: selectedItem.id,
            } as any,
            update: { quantity: { increment: 1 } },
            create: {
                item: {
                    connect: { id: selectedItem.id }
                },
                quantity: 1,
            } as any,
        });

        // 3. 実績更新
        if (!existingInventory) {
            const rarityKeyMap: Record<string, string> = {
                normal: 'collectedNormalItemTypesCount',
                uncommon: 'collectedUncommonItemTypesCount',
                rare: 'collectedRareItemTypesCount',
                epic: 'collectedEpicItemTypesCount',
                legendary: 'collectedLegendaryItemTypesCount',
            };

            const targetField = rarityKeyMap[selectedItem.rarity] || 'collectedNormalItemTypesCount';

            const updateData: any = {
                collectedItemTypesCount: { increment: 1 },
            };
            updateData[targetField] = { increment: 1 };

            const createData: any = {
                id: 1, // 固定ID
                collectedItemTypesCount: 1,
            };
            createData[targetField] = 1;

            // ★ 型定義のキャッシュ不整合を回避するために as any を使用
            await prisma.userProgress.upsert({
                where: { id: 1 } as any,
                update: updateData,
                create: createData as any,
            });
        }

        return NextResponse.json(selectedItem);

    } catch (error: any) {
        console.error("Failed to obtain item:", error);
        return NextResponse.json({ message: 'アイテムの獲得に失敗しました。' }, { status: 500 });
    }
}