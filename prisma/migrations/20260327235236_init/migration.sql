-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sqft" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "daysOpen" INTEGER NOT NULL,
    "weeklyTraffic" INTEGER NOT NULL,
    "notes" TEXT,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "POSRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venueId" TEXT NOT NULL,
    "businessDate" DATETIME NOT NULL,
    "menuGroup" TEXT NOT NULL,
    "menuItem" TEXT NOT NULL,
    "spiritCategory" TEXT,
    "qtySold" INTEGER NOT NULL,
    "grossSales" REAL NOT NULL,
    "itemCost" REAL NOT NULL,
    "netSales" REAL NOT NULL,
    "voidQty" INTEGER NOT NULL DEFAULT 0,
    "compQty" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "POSRecord_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venueId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "guestName" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "lifetimeSpend" REAL NOT NULL DEFAULT 0,
    "tags" TEXT,
    "noShow" BOOLEAN NOT NULL DEFAULT false,
    "dataSource" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReservationRecord_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipelineDeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prospect',
    "value" REAL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "venues" TEXT,
    "nextAction" TEXT,
    "nextActionDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PitchLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brandName" TEXT,
    "category" TEXT,
    "venueIds" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "APICredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "lastSync" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'configured',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecapLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "POSRecord_venueId_businessDate_idx" ON "POSRecord"("venueId", "businessDate");

-- CreateIndex
CREATE INDEX "POSRecord_spiritCategory_idx" ON "POSRecord"("spiritCategory");

-- CreateIndex
CREATE INDEX "POSRecord_menuItem_idx" ON "POSRecord"("menuItem");

-- CreateIndex
CREATE INDEX "ReservationRecord_venueId_date_idx" ON "ReservationRecord"("venueId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PitchLink_token_key" ON "PitchLink"("token");
