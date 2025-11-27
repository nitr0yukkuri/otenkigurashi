-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";
ALTER TABLE "public"."UserInventory" DROP CONSTRAINT "UserInventory_userId_fkey";
ALTER TABLE "public"."UserProgress" DROP CONSTRAINT "UserProgress_userId_fkey";

-- DropIndex
-- DROP INDEX "public"."UserInventory_userId_itemId_key"; -- 削除しない
-- DROP INDEX "public"."UserProgress_userId_key"; -- 削除しない

-- AlterTable
-- ALTER TABLE "UserInventory" DROP COLUMN "userId"; -- 削除しない

-- AlterTable
ALTER TABLE "UserProgress"
-- DROP COLUMN "userId", -- 削除しない
ALTER COLUMN "id" SET DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "userprogress_id_seq";

-- DropTable
DROP TABLE "public"."Account";
-- DropTable
DROP TABLE "public"."Session";
-- DropTable
DROP TABLE "public"."User";
-- DropTable
DROP TABLE "public"."VerificationToken";

-- CreateIndex
-- CREATE UNIQUE INDEX "UserInventory_itemId_key" ON "UserInventory"("itemId"); -- 削除しない（複合キーを維持）