
/*
Set1 - CREATE TABLE tblFiles
Set2 - CREATE TABLE tblFiles_AuditExact & Triggers
*/

DROP TABLE [dbo].[tblFiles]
DROP TABLE [dbo].[tblFiles_AuditExact]

-- Set1

USE [drive]
GO

CREATE TABLE [dbo].[tblFiles]
(
	[id] INT NOT NULL IDENTITY(1, 1),
	[userId] INT NOT NULL,
	[serverDate] DATETIME NOT NULL DEFAULT GETDATE(),
	[name] VARCHAR(255),
	[data] VARCHAR(MAX) NOT NULL,
	[size] INT NOT NULL,
	[appId] INT NOT NULL,
	[token] VARCHAR(32) NOT NULL,
	[mimetype] VARCHAR(255) NOT NULL,
	[organizationOnly] INT NOT NULL,
	PRIMARY KEY (id)
)

-- Set1

-- Set2

PRINT 'Executing dbo.tblFiles_AuditExact.TAB'
GO

USE [drive]
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tblFiles_AuditExact' AND type = 'U')
BEGIN
	CREATE TABLE [dbo].[tblFiles_AuditExact]
	(
		[id] INT IDENTITY (1, 1) NOT NULL,
		[userId] INT NOT NULL,
		[idOriginal] INT NOT NULL,
		[userAction] INT NOT NULL,
		[dateAction] DATETIME NOT NULL CONSTRAINT DF_tblFiles_AuditExact_dateAction DEFAULT GETDATE(),
		[name] VARCHAR(255) NOT NULL,
		[data] VARCHAR(MAX) NOT NULL,
		[size] INT NOT NULL,
		[appId] INT NOT NULL,
		[token] VARCHAR(32) NOT NULL,
		[mimetype] VARCHAR(255) NOT NULL,
		[organizationOnly] INT NOT NULL,
		CONSTRAINT PK_tblFiles_AuditExact PRIMARY KEY CLUSTERED (ID)
	)
END
GO

PRINT 'Executing dbo.tr_tblFiles_AuditExact.TRG'
GO

USE [drive]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'tr_tblFiles_AuditExact' AND type = 'TR')
BEGIN
	DROP TRIGGER tr_tblFiles_AuditExact
END
GO

CREATE TRIGGER
	[dbo].[tr_tblFiles_AuditExact]
ON
	[dbo].[tblFiles]
AFTER
	INSERT, UPDATE, DELETE
AS

BEGIN

	SET NOCOUNT ON

	--Insert
	IF ((SELECT Count(id) FROM Inserted)) != 0 AND ((SELECT Count(id) FROM Deleted) = 0)
	BEGIN
		INSERT INTO tblFiles_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[name],
				[data],
				[size],
				[appId],
				[token],
				[mimetype],
				[organizationOnly]
			)
		SELECT
			[id],
			[userId],
			1,
			[name],
			[data],
			[size],
			[appId],
			[token],
			[mimetype],
			[organizationOnly]
		FROM Inserted
	END


	--Update
	IF ((SELECT Count(id) FROM Inserted)) != 0 AND ((SELECT Count(id) FROM Deleted) != 0)
	BEGIN
		INSERT INTO tblFiles_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[name],
				[data],
				[size],
				[appId],
				[token],
				[mimetype],
				[organizationOnly]
			)
		SELECT
			[id],
			[userId],
			2,
			[name],
			[data],
			[size],
			[appId],
			[token],
			[mimetype],
			[organizationOnly]
		FROM Inserted
	END

	--Delete
	IF ((SELECT Count(id) FROM Inserted)) = 0 AND ((SELECT Count(id) FROM Deleted) != 0)
	BEGIN
		INSERT INTO tblFiles_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[name],
				[data],
				[size],
				[appId],
				[token],
				[mimetype],
				[organizationOnly]
			)
		SELECT
			[id],
			[userId],
			3,
			[name],
			[data],
			[size],
			[appId],
			[token],
			[mimetype],
			[organizationOnly]
		FROM Deleted
	END

END
GO

-- Set2
/*
Set1 - CREATE TABLE tblFilesUsers & CREATE UNIQUE INDEX
Set2 - CREATE TABLE tblFilesUsers_AuditExact & Triggers
*/

-- DROP TABLE [dbo].[tblFilesUsers]
-- DROP TABLE [dbo].[tblFilesUsers_AuditExact]

-- Set1

USE [drive]
GO

CREATE TABLE [dbo].[tblFilesUsers]
(
	[id] INT NOT NULL IDENTITY(1, 1),
	[userId] INT NOT NULL,
	[serverDate] DATETIME NOT NULL DEFAULT GETDATE(),
	[role] INT NOT NULL,
	[fileId] INT NOT NULL,
	PRIMARY KEY (id)
)

CREATE UNIQUE INDEX tblFilesUsersFileIdUserId ON [dbo].[tblFilesUsers] (fileId, userId)

-- Set1

-- Set2

PRINT 'Executing dbo.tblFilesUsers_AuditExact.TAB'
GO

USE [drive]
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tblFilesUsers_AuditExact' AND type = 'U')
BEGIN
	CREATE TABLE [dbo].[tblFilesUsers_AuditExact]
	(
		[id] INT IDENTITY (1, 1) NOT NULL,
		[userId] INT NOT NULL,
		[idOriginal] INT NOT NULL,
		[userAction] INT NOT NULL,
		[dateAction] DATETIME NOT NULL CONSTRAINT DF_tblFilesUsers_AuditExact_dateAction DEFAULT GETDATE(),
		[role] INT NOT NULL,
		[fileId] INT NOT NULL,
		CONSTRAINT PK_tblFilesUsers_AuditExact PRIMARY KEY CLUSTERED (ID)
	)
END
GO

PRINT 'Executing dbo.tr_tblFilesUsers_AuditExact.TRG'
GO

USE [drive]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'tr_tblFilesUsers_AuditExact' AND type = 'TR')
BEGIN
	DROP TRIGGER tr_tblFilesUsers_AuditExact
END
GO

CREATE TRIGGER
	[dbo].[tr_tblFilesUsers_AuditExact]
ON
	[dbo].[tblFilesUsers]
AFTER
	INSERT, UPDATE, DELETE
AS

BEGIN

	SET NOCOUNT ON

	--Insert
	IF ((SELECT Count(id) FROM Inserted)) != 0 AND ((SELECT Count(id) FROM Deleted) = 0)
	BEGIN
		INSERT INTO tblFilesUsers_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[role],
				[fileId]
			)
		SELECT
			[id],
			[userId],
			1,
			[role],
			[fileId]
		FROM Inserted
	END


	--Update
	IF ((SELECT Count(id) FROM Inserted)) != 0 AND ((SELECT Count(id) FROM Deleted) != 0)
	BEGIN
		INSERT INTO tblFilesUsers_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[role],
				[fileId]
			)
		SELECT
			[id],
			[userId],
			2,
			[role],
			[fileId]
		FROM Inserted
	END

	--Delete
	IF ((SELECT Count(id) FROM Inserted)) = 0 AND ((SELECT Count(id) FROM Deleted) != 0)
	BEGIN
		INSERT INTO tblFilesUsers_AuditExact
			(
				[idOriginal],
				[userId],
				[userAction],
				[role],
				[fileId]
			)
		SELECT
			[id],
			[userId],
			3,
			[role],
			[fileId]
		FROM Deleted
	END

END
GO

-- Set2
/*
SET1 - CREATE TABLE tblZips
*/

IF EXISTS (SELECT * FROM [sys].[objects] WHERE [name] = 'tblZips' AND [type] = 'U')
BEGIN
	DROP TABLE [dbo].[tblZips]
END
GO

-- SET1

CREATE TABLE [dbo].[tblZips]
(
	[id] INT NOT NULL IDENTITY(1, 1),
	[userId] INT NOT NULL,
	[serverDate] DATETIME NOT NULL DEFAULT GETDATE(),
	[data] VARCHAR(MAX) NOT NULL,
	[appId] INT NOT NULL,
	[token] VARCHAR(32) NOT NULL,
	PRIMARY KEY (id)
)

-- SET1