-- AlterTable
ALTER TABLE "BorrowRequest" ADD COLUMN     "borrowId" TEXT,
ADD COLUMN     "requestType" TEXT NOT NULL DEFAULT 'BORROW';
