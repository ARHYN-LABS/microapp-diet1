-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScanHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productName` VARCHAR(191) NULL,
    `extractedText` JSON NULL,
    `parsedNutrition` JSON NULL,
    `parsedIngredients` JSON NULL,
    `analysisSnapshot` JSON NULL,

    INDEX `ScanHistory_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPrefs` (
    `userId` VARCHAR(191) NOT NULL,
    `halalCheckEnabled` BOOLEAN NOT NULL DEFAULT false,
    `lowSodiumMgLimit` DOUBLE NULL,
    `lowSugarGlimit` DOUBLE NULL,
    `lowCarbGlimit` DOUBLE NULL,
    `lowCalorieLimit` DOUBLE NULL,
    `highProteinGtarget` DOUBLE NULL,
    `vegetarian` BOOLEAN NULL,
    `vegan` BOOLEAN NULL,
    `sensitiveStomach` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScanHistory` ADD CONSTRAINT `ScanHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPrefs` ADD CONSTRAINT `UserPrefs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
