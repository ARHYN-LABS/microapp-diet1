ALTER TABLE `User`
  ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
  ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL,
  ADD COLUMN `planName` VARCHAR(191) NOT NULL DEFAULT 'free',
  ADD COLUMN `scansUsed` INT NOT NULL DEFAULT 0,
  ADD COLUMN `scanLimit` INT NOT NULL DEFAULT 10,
  ADD COLUMN `billingStartDate` DATETIME(3) NULL;

CREATE UNIQUE INDEX `User_stripeCustomerId_key` ON `User`(`stripeCustomerId`);
CREATE UNIQUE INDEX `User_stripeSubscriptionId_key` ON `User`(`stripeSubscriptionId`);
