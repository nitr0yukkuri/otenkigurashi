
import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allItems = await prisma.item.findMany({
            orderBy: { id: 'asc' },
        });
        const inventory = await prisma.userInventory.findMany();
        const collection = allItems.map(item => {
            const inventoryItem = inventory.find(inv => inv.itemId === item.id);
            return {
                ...item,
                quantity: inventoryItem ? inventoryItem.quantity : 0,
            };
        });
        return NextResponse.json(collection);
    } catch (error) {
        console.error("Failed to fetch collection:", error);
        return NextResponse.json({ message: 'コレクションの取得に失敗しました。' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { itemId } = await request.json();
        const numericItemId = Number(itemId);

        if (isNaN(numericItemId)) {
            return NextResponse.json({ message: '無効なアイテムIDです。' }, { status: 400 });
        }
        if (!itemId) {
            return NextResponse.json({ message: 'アイテムIDが必要です。' }, { status: 400 });
        }

        const existingItemInventory = await prisma.userInventory.findUnique({
            where: { itemId: numericItemId },
        });

        if (existingItemInventory) {
            // 既に持っている場合は数量だけ増やす
            await prisma.userInventory.update({
                where: { itemId: numericItemId },
                data: { quantity: { increment: 1 } },
            });
        } else {
            // ★★★ 修正: 初めて入手する場合は、インベントリ作成と実績カウントアップを同時に行う ★★★

            // 1. アイテム情報を取得してレアリティを確認
            const itemData = await prisma.item.findUnique({
                where: { id: numericItemId }
            });

            if (!itemData) {
                return NextResponse.json({ message: 'アイテムが存在しません。' }, { status: 404 });
            }

            // 2. レアリティに応じたカウントアップ用キーを作成 (例: collectedRareItemTypesCount)
            const rarityCapitalized = itemData.rarity.charAt(0).toUpperCase() + itemData.rarity.slice(1);
            const rarityCountKey = `collected${rarityCapitalized}ItemTypesCount`;

            // 3. トランザクションで一括更新
            await prisma.$transaction([
                // インベントリに登録
                prisma.userInventory.create({
                    data: {
                        itemId: numericItemId,
                        quantity: 1,
                    },
                }),
                // 実績データのカウントを加算 (id: 1 固定)
                prisma.userProgress.update({
                    where: { id: 1 },
                    data: {
                        collectedItemTypesCount: { increment: 1 }, // 総種類数
                        [rarityCountKey]: { increment: 1 }         // レア度別種類数
                    }
                })
            ]);
        }
        return NextResponse.json({ message: 'コレクションを更新しました。' });
    } catch (error) {
        console.error("Failed to update collection:", error);
        return NextResponse.json({ message: 'コレクションの更新に失敗しました。' }, { status: 500 });
    }
}