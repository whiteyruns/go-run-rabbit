-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stageName" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "born" TEXT NOT NULL DEFAULT '',
    "nationality" TEXT NOT NULL,
    "genres" TEXT NOT NULL DEFAULT '[]',
    "yearsActive" TEXT NOT NULL,
    "signature" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL,
    "hits" TEXT NOT NULL,
    "albums" TEXT NOT NULL DEFAULT '[]',
    "collaborations" TEXT NOT NULL DEFAULT '[]',
    "milestones" TEXT NOT NULL,
    "reach" TEXT NOT NULL,
    "outreachExamples" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Artist" ("bio", "createdAt", "hits", "id", "milestones", "nationality", "reach", "realName", "stageName", "updatedAt", "yearsActive") SELECT "bio", "createdAt", "hits", "id", "milestones", "nationality", "reach", "realName", "stageName", "updatedAt", "yearsActive" FROM "Artist";
DROP TABLE "Artist";
ALTER TABLE "new_Artist" RENAME TO "Artist";
CREATE UNIQUE INDEX "Artist_stageName_key" ON "Artist"("stageName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
