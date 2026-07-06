-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
