-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'normal',
    "iconName" TEXT,
    "weather" TEXT,
    "stage" TEXT,
    "category" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "walkCount" INTEGER NOT NULL DEFAULT 0,
    "sunnyWalkCount" INTEGER NOT NULL DEFAULT 0,
    "clearWalkCount" INTEGER NOT NULL DEFAULT 0,
    "rainyWalkCount" INTEGER NOT NULL DEFAULT 0,
    "cloudyWalkCount" INTEGER NOT NULL DEFAULT 0,
    "snowyWalkCount" INTEGER NOT NULL DEFAULT 0,
    "thunderstormWalkCount" INTEGER NOT NULL DEFAULT 0,
    "windyWalkCount" INTEGER NOT NULL DEFAULT 0,
    "nightWalkCount" INTEGER NOT NULL DEFAULT 0,
    "collectedItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "collectedNormalItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "collectedUncommonItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "collectedRareItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "collectedEpicItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "collectedLegendaryItemTypesCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveWalkDays" INTEGER NOT NULL DEFAULT 0,
    "lastWalkDate" TIMESTAMP(3),

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInventory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInventory_userId_itemId_key" ON "UserInventory"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "UserInventory" ADD CONSTRAINT "UserInventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
