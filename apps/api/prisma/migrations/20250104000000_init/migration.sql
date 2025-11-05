-- CreateTable
CREATE TABLE "intents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invites_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "intents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendances_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attendances_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "introductions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromMemberId" TEXT NOT NULL,
    "toMemberId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "introductions_fromMemberId_fkey" FOREIGN KEY ("fromMemberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "introductions_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "thank_yous" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "introductionId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "thank_yous_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "introductions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "one_on_ones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberAId" TEXT NOT NULL,
    "memberBId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "one_on_ones_memberAId_fkey" FOREIGN KEY ("memberAId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "one_on_ones_memberBId_fkey" FOREIGN KEY ("memberBId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "intents_status_idx" ON "intents"("status");

-- CreateIndex
CREATE INDEX "intents_email_idx" ON "intents"("email");

-- CreateIndex
CREATE INDEX "intents_createdAt_idx" ON "intents"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "invites_intentId_key" ON "invites"("intentId");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_status_idx" ON "invites"("status");

-- CreateIndex
CREATE INDEX "invites_expiresAt_idx" ON "invites"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "members_role_idx" ON "members"("role");

-- CreateIndex
CREATE INDEX "meetings_date_idx" ON "meetings"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "attendances_memberId_meetingId_key" ON "attendances"("memberId", "meetingId");

-- CreateIndex
CREATE INDEX "attendances_memberId_idx" ON "attendances"("memberId");

-- CreateIndex
CREATE INDEX "attendances_meetingId_idx" ON "attendances"("meetingId");

-- CreateIndex
CREATE INDEX "introductions_fromMemberId_idx" ON "introductions"("fromMemberId");

-- CreateIndex
CREATE INDEX "introductions_toMemberId_idx" ON "introductions"("toMemberId");

-- CreateIndex
CREATE INDEX "introductions_status_idx" ON "introductions"("status");

-- CreateIndex
CREATE INDEX "introductions_createdAt_idx" ON "introductions"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "thank_yous_introductionId_idx" ON "thank_yous"("introductionId");

-- CreateIndex
CREATE INDEX "one_on_ones_memberAId_idx" ON "one_on_ones"("memberAId");

-- CreateIndex
CREATE INDEX "one_on_ones_memberBId_idx" ON "one_on_ones"("memberBId");

-- CreateIndex
CREATE INDEX "one_on_ones_date_idx" ON "one_on_ones"("date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_memberId_period_key" ON "invoices"("memberId", "period");

-- CreateIndex
CREATE INDEX "invoices_memberId_idx" ON "invoices"("memberId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueAt_idx" ON "invoices"("dueAt");
