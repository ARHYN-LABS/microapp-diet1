-- CreateTable
CREATE TABLE `ProfilePrefs` (
    `userId` VARCHAR(191) NOT NULL,
    `dob` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `dietaryOther` VARCHAR(191) NULL,
    `allergyOther` VARCHAR(191) NULL,
    `dietary` JSON NULL,
    `allergies` JSON NULL,
    `alerts` JSON NULL,
    `sensitivities` JSON NULL,
    `scoring` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProfilePrefs` ADD CONSTRAINT `ProfilePrefs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
