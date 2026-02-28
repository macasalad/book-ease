/*
  Warnings:

  - Added the required column `userId` to the `BookListing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookListing" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BookListing" ADD CONSTRAINT "BookListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
