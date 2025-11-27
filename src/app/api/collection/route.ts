// src/app/api/collection/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
        }

        const allItems = await prisma.item.findMany({
            orderBy: { id: 'asc' },
        });

        // ユーザーIDでフィルタリング
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

// アイテムの手動更新用（開発用など）
export async function POST(request: Request) {
    try {
        const { itemId, userId } = await request.json(); // userIdを受け取る
        const numericItemId = Number(itemId);

        if (!userId) {
            return NextResponse.json({ message: 'ユーザーIDが必要です。' }, { status: 400 });
        }
        if (isNaN(numericItemId)) {
            return NextResponse.json({ message: '無効なアイテムIDです。' }, { status: 400 });
        }
        if (!itemId) {
            return NextResponse.json({ message: 'アイテムIDが必要です。' }, { status: 400 });
        }

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
                    userId: userId,
                    item: { connect: { id: numericItemId } },
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