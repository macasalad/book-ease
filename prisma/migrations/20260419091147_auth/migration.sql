/*
  Warnings:

  - You are about to drop the column `borrowId` on the `BorrowRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BorrowRequest" DROP COLUMN "borrowId",
ALTER COLUMN "requestType" DROP DEFAULT;
