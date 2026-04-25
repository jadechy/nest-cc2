-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerifiedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiredAt" TIMESTAMP(3);
