import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // ★ ヘッダーからユーザーIDを取得
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
    }

    try {
        const allItems = await prisma.item.findMany({
            orderBy: { id: 'asc' },
        });

        // ★ ユーザーIDでフィルタリング
        const inventory = await prisma.userInventory.findMany({
            where: { userId: userId }
        });

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
    // ★ ヘッダーからユーザーIDを取得
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
    }

    try {
        const { itemId } = await request.json();
        const numericItemId = Number(itemId);

        if (isNaN(numericItemId)) {
            return NextResponse.json({ message: '無効なアイテムIDです。' }, { status: 400 });
        }
        if (!itemId) {
            return NextResponse.json({ message: 'アイテムIDが必要です。' }, { status: 400 });
        }

        // ★ 複合ユニークキーを使用して検索
        const existingItem = await prisma.userInventory.findUnique({
            where: {
                userId_itemId: {
                    userId: userId,
                    itemId: numericItemId
                }
            },
        });

        if (existingItem) {
            await prisma.userInventory.update({
                where: {
                    userId_itemId: {
                        userId: userId,
                        itemId: numericItemId
                    }
                },
                data: { quantity: { increment: 1 } },
            });
        } else {
            await prisma.userInventory.create({
                data: {
                    userId: userId, // ★ ユーザーIDを保存
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