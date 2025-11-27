import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
// import { getCurrentUser } from '@/app/lib/session'; // ★ 削除

export const dynamic = 'force-dynamic';

export async function GET() {
    // ★ ユーザー取得処理を削除
    try {
        const allItems = await prisma.item.findMany({
            orderBy: { id: 'asc' },
        });
        // ★ 取得条件 (where) を削除し、全インベントリを取得
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
    // ★ ユーザー取得処理を削除
    try {
        const { itemId } = await request.json();
        const numericItemId = Number(itemId); // ★念のためNumber型に変換

        if (isNaN(numericItemId)) { // ★ 型チェックを追加
            return NextResponse.json({ message: '無効なアイテムIDです。' }, { status: 400 });
        }
        if (!itemId) {
            return NextResponse.json({ message: 'アイテムIDが必要です。' }, { status: 400 });
        }

        // ★ where句を itemId のみに戻す
        const existingItem = await prisma.userInventory.findUnique({
            where: { itemId: numericItemId },
        });

        if (existingItem) {
            await prisma.userInventory.update({
                where: { itemId: numericItemId }, // ★ where句を itemId のみに戻す
                data: { quantity: { increment: 1 } },
            });
        } else {
            await prisma.userInventory.create({
                data: {
                    // ★ userId を削除
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