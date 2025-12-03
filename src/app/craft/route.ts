// src/app/api/craft/route.ts

import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import { RECIPES } from '../lib/recipes';

export async function POST(request: Request) {
    try {
        const { recipeId, userId } = await request.json();

        if (!userId || !recipeId) {
            return NextResponse.json({ message: 'リクエストが無効です。' }, { status: 400 });
        }

        const recipe = RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            return NextResponse.json({ message: 'レシピが見つかりません。' }, { status: 404 });
        }

        // トランザクションで在庫確認・消費・付与を一括実行
        const result = await prisma.$transaction(async (tx) => {
            // 1. 素材が足りているか確認
            for (const mat of recipe.materials) {
                const item = await tx.item.findUnique({ where: { name: mat.itemName } });
                if (!item) throw new Error(`素材 ${mat.itemName} が存在しません。`);

                const inventory = await tx.userInventory.findUnique({
                    where: { userId_itemId: { userId, itemId: item.id } }
                });

                if (!inventory || inventory.quantity < mat.count) {
                    throw new Error(`素材 ${mat.itemName} が足りません。`);
                }
            }

            // 2. 素材を消費
            for (const mat of recipe.materials) {
                const item = await tx.item.findUnique({ where: { name: mat.itemName } });
                if (item) {
                    await tx.userInventory.update({
                        where: { userId_itemId: { userId, itemId: item.id } },
                        data: { quantity: { decrement: mat.count } }
                    });
                }
            }

            // 3. 成果物を付与
            const resultItem = await tx.item.findUnique({ where: { name: recipe.resultItemName } });
            if (!resultItem) throw new Error(`成果物 ${recipe.resultItemName} のデータがありません。`);

            await tx.userInventory.upsert({
                where: { userId_itemId: { userId, itemId: resultItem.id } },
                update: { quantity: { increment: 1 } },
                create: {
                    userId,
                    itemId: resultItem.id,
                    quantity: 1
                }
            });

            return resultItem;
        });

        return NextResponse.json({ success: true, item: result });

    } catch (error: any) {
        console.error("Crafting failed:", error);
        return NextResponse.json({ message: error.message || 'クラフトに失敗しました。' }, { status: 500 });
    }
}