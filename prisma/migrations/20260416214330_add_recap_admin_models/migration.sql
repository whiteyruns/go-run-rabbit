-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stageName" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "yearsActive" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "hits" TEXT NOT NULL,
    "milestones" TEXT NOT NULL,
    "reach" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FtbRecap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "headliner" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "eventDay" TEXT NOT NULL,
    "placerData" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "sponsors" TEXT NOT NULL,
    "execSummary" TEXT,
    "artistId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "FtbRecap_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FtbRecapRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recapId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "group" TEXT,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "openedAt" DATETIME,
    "resendId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FtbRecapRecipient_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "FtbRecap" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FtbRecipientGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_stageName_key" ON "Artist"("stageName");

-- CreateIndex
CREATE UNIQUE INDEX "FtbRecap_eventId_key" ON "FtbRecap"("eventId");

-- CreateIndex
CREATE INDEX "FtbRecapRecipient_recapId_idx" ON "FtbRecapRecipient"("recapId");

-- CreateIndex
CREATE INDEX "FtbRecapRecipient_resendId_idx" ON "FtbRecapRecipient"("resendId");

-- CreateIndex
CREATE UNIQUE INDEX "FtbRecipientGroup_name_key" ON "FtbRecipientGroup"("name");
