import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // userIdチェックを削除

    try {
        const allItems = await prisma.item.findMany({
            orderBy: { id: 'asc' },
        });

        // userIdフィルタを削除し、全インベントリを取得
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
    // userIdチェックを削除

    try {
        const { itemId } = await request.json();
        const numericItemId = Number(itemId);

        if (isNaN(numericItemId)) {
            return NextResponse.json({ message: '無効なアイテムIDです。' }, { status: 400 });
        }
        if (!itemId) {
            return NextResponse.json({ message: 'アイテムIDが必要です。' }, { status: 400 });
        }

        // itemIdのみで検索
        const existingItem = await prisma.userInventory.findUnique({
            where: {
                itemId: numericItemId
            },
        });

        if (existingItem) {
            await prisma.userInventory.update({
                where: {
                    itemId: numericItemId
                },
                data: { quantity: { increment: 1 } },
            });
        } else {
            await prisma.userInventory.create({
                data: {
                    itemId: numericItemId,
                    quantity: 1,
                },
            });
        }
        return NextResponse.json({ message: 'コレクションを更新しました。' });
    } catch (error) {
        console.error("Failed to update collection:", error);
        return NextResponse.json({ message: 'コレクションの更新に失敗しました。' }, { status: 500 });
    }
}