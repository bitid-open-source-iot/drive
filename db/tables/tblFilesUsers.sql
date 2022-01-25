/*
Set1 - CREATE TABLE tblFilesUsers & CREATE UNIQUE INDEX
Set2 - CREATE TABLE tblFilesUsers_AuditExact & Triggers
*/

IF EXISTS (SELECT * FROM [sys].[objects] WHERE [name] = 'tblFilesUsers' AND [type] = 'U')
BEGIN
	DROP TABLE [dbo].[tblFilesUsers]
END
GO

IF EXISTS (SELECT * FROM [sys].[objects] WHERE [name] = 'tblFilesUsers_AuditExact' AND [type] = 'U')
BEGIN
	DROP TABLE [dbo].[tblFilesUsers_AuditExact]
END
GO

-- Set1

CREATE TABLE [dbo].[tblFilesUsers]
(
	[id] INT NOT NULL IDENTITY(1, 1),
	[userId] INT NOT NULL,
	[serverDate] DATETIME NOT NULL DEFAULT GETDATE(),
	[role] INT NOT NULL,
	[fileId] INT NOT NULL,
	PRIMARY KEY (id)
)

CREATE UNIQUE INDEX tblFilesUsersFileIdUserId ON [dbo].[tblFilesUsers] ([fileId], [userId])

-- Set1

-- Set2

PRINT 'Executing dbo.tblFilesUsers_AuditExact.TAB'
GO

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

PRINT 'Executing dbo.tr_tblFilesUsers_AuditExact.TRG'
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