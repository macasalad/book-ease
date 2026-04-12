-- AlterTable
ALTER TABLE "BorrowRecord" ADD COLUMN     "dueAt" TIMESTAMP(3),
ADD COLUMN     "extended" BOOLEAN NOT NULL DEFAULT false;
