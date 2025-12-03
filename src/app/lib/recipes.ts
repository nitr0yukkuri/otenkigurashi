// src/app/lib/recipes.ts

export interface Recipe {
    id: string;
    resultItemName: string;
    materials: { itemName: string; count: number }[];
}

export const RECIPES: Recipe[] = [
    {
        id: 'bug_net',
        resultItemName: '虫取り網',
        materials: [
            { itemName: '小枝', count: 3 },
            { itemName: 'クモの糸', count: 1 },
        ],
    },
    {
        id: 'rainbow_necklace',
        resultItemName: '虹色のネックレス',
        materials: [
            { itemName: 'きれいな小石', count: 5 },
            { itemName: '虹のかけら', count: 1 },
        ],
    },
    {
        id: 'teru_teru_bozu',
        resultItemName: 'てるてる坊主',
        materials: [
            { itemName: 'わたぐも', count: 3 },
            { itemName: 'なくしたボタン', count: 1 },
        ],
    },
];