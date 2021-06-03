/*
Set1 - CREATE STORED PROCEDURE FILE ADD
Set2 - CREATE STORED PROCEDURE FILE GET
Set3 - CREATE STORED PROCEDURE FILE LIST
Set4 - CREATE STORED PROCEDURE FILE UPDATE
Set5 - CREATE STORED PROCEDURE FILE DELETE
*/

-- Set1

PRINT 'Executing dbo.v1_Files_Add.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Add' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Add]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Add]
	@name VARCHAR(255),
	@data BINARY,
	@size INT,
	@appId INT,
	@token VARCHAR(32),
	@userId INT,
	@mimetype VARCHAR(255),
	@organizationOnly INT
AS

SET NOCOUNT ON

BEGIN TRY
	INSERT INTO [dbo].[tblFiles]
		(
			[name],
			[data],
			[size],
			[appId],
			[token],
			[userId],
			[mimetype],
			[organizationOnly]
		)
	VALUES
		(
			@name,
			@data,
			@size,
			@appId,
			@token,
			@userId,
			@mimetype,
			@organizationOnly
		)

	SELECT SCOPE_IDENTITY() AS [id]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set1

-- Set2

PRINT 'Executing dbo.v1_Files_Get.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Get' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Get]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Get]
	@token VARCHAR(32),
	@fileId INT,
	@userId INT
AS

SET NOCOUNT ON

BEGIN TRY
	IF (@token IS NOT NULL AND @fileId IS NOT NULL)
	BEGIN
		SELECT TOP 1
			[file].[id],
			[user].[role],
			[file].[name],
			[file].[data],
			[file].[size],
			[file].[appId],
			[file].[token],
			[file].[userId],
			[user].[userId],
			[file].[mimetype],
			[file].[organizationOnly]
		FROM
			[dbo].[tblFiles] AS [file]
		INNER JOIN
			[dbo].[tblFilesUsers] AS [user]
		ON
			[file].[id] = [user].[fileId]
		WHERE
			[file].[id] = @fileId
			AND
			[file].[token] = @token

		IF (@@ROWCOUNT = 0)
		BEGIN
			SELECT 'No records found!' AS [message], 69 AS [code]
			RETURN 0
		END
	END

	IF (@userId IS NOT NULL AND @fileId IS NOT NULL)
	BEGIN
		SELECT TOP 1
			[file].[id],
			[user].[role],
			[file].[name],
			[file].[data],
			[file].[size],
			[file].[appId],
			[file].[token],
			[file].[userId],
			[user].[userId],
			[file].[mimetype],
			[file].[organizationOnly]
		FROM
			[dbo].[tblFiles] AS [file]
		INNER JOIN
			[dbo].[tblFilesUsers] AS [user]
		ON
			[file].[id] = [user].[fileId]
		WHERE
			[file].[id] IN (SELECT TOP 1 [fileId] FROM [dbo].[tblFilesUsers] WHERE [userId] = @userId)

		IF (@@ROWCOUNT = 0)
		BEGIN
			SELECT 'No records found!' AS [message], 69 AS [code]
			RETURN 0
		END
	END

	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set2

-- Set3

PRINT 'Executing dbo.v1_Files_List.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_List' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_List]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_List]
	@userId INT
AS

SET NOCOUNT ON

BEGIN TRY
	SELECT
			[file].[id],
			[user].[role],
			[file].[name],
			[file].[data],
			[file].[size],
			[file].[appId],
			[file].[token],
			[file].[userId],
			[user].[userId],
			[file].[mimetype],
			[file].[organizationOnly]
		FROM
			[dbo].[tblFiles] AS [file]
		INNER JOIN
			[dbo].[tblFilesUsers] AS [user]
		ON
			[file].[id] = [user].[fileId]
		WHERE
			[file].[id] IN (SELECT TOP 1 [fileId] FROM [dbo].[tblFilesUsers] WHERE [userId] = @userId)

	IF (@@ROWCOUNT = 0)
	BEGIN
		SELECT 'No records found!' AS [message], 69 AS [code]
		RETURN 0
	END
		
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set3

-- Set4

PRINT 'Executing dbo.v1_Files_Update.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Update' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Update]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Update]
	@name VARCHAR(255),
	@data BINARY,
	@size INT,
	@appId INT,
	@token VARCHAR(32),
	@fileId INT,
	@userId INT,
	@mimetype VARCHAR(255),
	@organizationOnly INT
AS

SET NOCOUNT ON

BEGIN TRY
	DECLARE @role INT = 0
	DECLARE @updated INT = 0

	SELECT TOP 1
		@role = [role]
	FROM
		[dbo].[tblFilesUsers]
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @userId

	IF (@@ROWCOUNT = 0)
	BEGIN
		SELECT 'File does not exist!' AS [message], 69 AS [code]
		RETURN 0
	END

	IF (@role < 2)
	BEGIN
		SELECT 'You cannot update file!' AS [message], 503 AS [code]
		RETURN 0
	END

	UPDATE [dbo].[tblFiles] SET [name] = @name WHERE [id] = @appId AND @name IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [data] = @data WHERE [id] = @appId AND @data IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [size] = @size WHERE [id] = @appId AND @size IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [appId] = @appId WHERE [id] = @appId AND @appId IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [token] = @token WHERE [id] = @appId AND @token IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [userId] = @userId WHERE [id] = @appId AND @userId IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [mimetype] = @mimetype WHERE [id] = @appId AND @mimetype IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [organizationOnly] = @organizationOnly WHERE [id] = @appId AND @organizationOnly IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT
	
	SELECT @updated AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set4

-- Set5

PRINT 'Executing dbo.v1_Files_Delete.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Delete' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Delete]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Delete]
	@fileId INT,
	@userId INT
AS

SET NOCOUNT ON

BEGIN TRY
	BEGIN TRAN
		DECLARE @id INT = 0
		DECLARE @role INT = 0
		DECLARE @deleted INT = 0

		SELECT TOP 1
			@id = [fileId],
			@role = [role]
		FROM
			[dbo].[tblFilesUsers]
		WHERE
			[fileId] = @fileId
			AND
			[userId] = @userId

		IF (@@ROWCOUNT = 0)
		BEGIN
			SELECT 'You are not a user on this file' AS [message], 503 AS [code]
			RETURN 0
		END

		IF (@role < 5)
		BEGIN
			SELECT 'Only owners can remove files' AS [message], 503 AS [code]
			RETURN 0
		END

		DELETE FROM
			[dbo].[tblFiles]
		WHERE
			[id] = @fileId

		SET @deleted = @deleted + @@ROWCOUNT

		DELETE FROM
			[dbo].[tblFilesUsers]
		WHERE
			[fileId] = @fileId

		SET @deleted = @deleted + @@ROWCOUNT
	COMMIT TRAN

	SELECT @deleted AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set5