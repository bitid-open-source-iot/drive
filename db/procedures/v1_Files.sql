/*
Set1 - CREATE STORED PROCEDURE FILE ADD
Set2 - CREATE STORED PROCEDURE FILE GET
Set3 - CREATE STORED PROCEDURE FILE LIST
Set4 - CREATE STORED PROCEDURE FILE SHARE
Set5 - CREATE STORED PROCEDURE FILE UPDATE
Set6 - CREATE STORED PROCEDURE FILE DELETE
Set7 - CREATE STORED PROCEDURE FILE UNSUBSCRIBE
Set8 - CREATE STORED PROCEDURE FILE CHANGE OWNER
Set9 - CREATE STORED PROCEDURE FILE UPDATE SUBSCRIBER
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
	BEGIN TRANSACTION
		DECLARE @id INT

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

		SET @id = SCOPE_IDENTITY()

		INSERT INTO [dbo].[tblFilesUsers]
			(
				[role],
				[fileId],
				[userId]
			)
		VALUES
			(
				5,
				@id,
				@userId
			)
		
		SELECT @id AS [id], @token AS [token]
	COMMIT TRANSACTION
	
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	ROLLBACK TRANSACTION
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
	@fileId INT
AS

SET NOCOUNT ON

BEGIN TRY
	SELECT TOP 1
		[name],
		[data],
		[size],
		[mimetype]
	FROM
		[dbo].[tblFiles] AS [file]
	WHERE
		[file].[id] = @fileId
		AND
		[file].[token] = @token

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
			[user].[userId],
			[file].[mimetype],
			[file].[serverDate],
			[file].[organizationOnly]
		FROM
			[dbo].[tblFiles] AS [file]
		INNER JOIN
			[dbo].[tblFilesUsers] AS [user]
		ON
			[file].[id] = [user].[fileId]
		WHERE
			[file].[id] IN (SELECT [fileId] FROM [dbo].[tblFilesUsers] WHERE [userId] = @userId)

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

PRINT 'Executing dbo.v1_Files_Share.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Share' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Share]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Share]
	@role INT,
	@fileId INT,
	@userId INT,
	@adminId INT
AS

SET NOCOUNT ON

BEGIN TRY
	DECLARE @updated INT = 0
	DECLARE @adminRole INT = 0

	SELECT TOP 1
		@adminRole = [role]
	FROM
		[dbo].[tblFilesUsers]
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @adminId

	IF (@@ROWCOUNT = 0)
	BEGIN
		SELECT 'File does not exist or you are not shared to the file!' AS [message], 69 AS [code]
		RETURN 0
	END

	IF (@adminRole < 4)
	BEGIN
		SELECT 'You cannot share users to the file as you are not an admin or owner!' AS [message], 503 AS [code]
		RETURN 0
	END

	IF (@role > @adminRole AND @role < 5)
	BEGIN
		SELECT 'You cannot share users with a higher role then your own!' AS [message], 503 AS [code]
		RETURN 0
	END

	IF (@role >= 5)
	BEGIN
		SELECT 'You cannot share a user as an owner!' AS [message], 503 AS [code]
		RETURN 0
	END

	INSERT INTO
		[dbo].[tblFilesUsers]
		(
			[role],
			[fileId],
			[userId]
		)
	VALUES
		(
			@role,
			@fileId,
			@userId
		)

	SELECT @@ROWCOUNT AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set4

-- Set5

PRINT 'Executing dbo.v1_Files_Update.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Update' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Update]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Update]
	@name VARCHAR(255),
	@appId INT,
	@fileId INT,
	@userId INT,
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

	UPDATE [dbo].[tblFiles] SET [name] = @name WHERE [id] = @fileId AND @name IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [appId] = @appId WHERE [id] = @fileId AND @appId IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT

	UPDATE [dbo].[tblFiles] SET [organizationOnly] = @organizationOnly WHERE [id] = @fileId AND @organizationOnly IS NOT NULL
	SET @updated = @updated + @@ROWCOUNT
	
	SELECT @updated AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set5

-- Set6

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
	BEGIN TRANSACTION
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
	
		SELECT @deleted AS [n]
	COMMIT TRANSACTION
	
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	ROLLBACK TRANSACTION
	RETURN 0
END CATCH
GO

-- Set6

-- Set7

PRINT 'Executing dbo.v1_Files_Unsubscribe.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Unsubscribe' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Unsubscribe]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Unsubscribe]
	@fileId INT,
	@userId INT,
	@adminId INT
AS

SET NOCOUNT ON

BEGIN TRY
	DECLARE @id INT = 0
	DECLARE @adminRole INT = 0

	SELECT TOP 1
		@adminRole = [role]
	FROM
		[dbo].[tblFilesUsers]
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @adminId

	IF (@@ROWCOUNT = 0)
	BEGIN
		SELECT 'You are not a user on this file!' AS [message], 503 AS [code]
		RETURN 0
	END

	IF (@adminRole = 5 AND @userId = @adminId)
	BEGIN
		SELECT 'You must remove file, owners cannet be unsubscribed!' AS [message], 503 AS [code]
		RETURN 0
	END

	DELETE FROM
		[dbo].[tblFilesUsers]
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @userId

	SELECT @@ROWCOUNT AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set7

-- Set8

PRINT 'Executing dbo.v1_Files_Change_Owner.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Change_Owner' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Change_Owner]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Change_Owner]
	@fileId INT,
	@userId INT,
	@adminId INT
AS

SET NOCOUNT ON

BEGIN TRY
	BEGIN TRANSACTION
		DECLARE @id INT = 0
		DECLARE @role INT = 0
		DECLARE @updated INT = 0
		DECLARE @adminRole INT = 0

		SELECT TOP 1
			@adminRole = [role]
		FROM
			[dbo].[tblFilesUsers]
		WHERE
			[fileId] = @fileId
			AND
			[userId] = @adminId

		IF (@@ROWCOUNT = 0)
		BEGIN
			SELECT 'You are not a user on this file!' AS [message], 503 AS [code]
			RETURN 0
		END

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
			SELECT 'User is not shared this file!' AS [message], 503 AS [code]
			RETURN 0
		END

		IF (@adminRole < 5)
		BEGIN
			SELECT 'Only owners can create new owners!' AS [message], 503 AS [code]
			RETURN 0
		END

		UPDATE [dbo].[tblFilesUsers] SET [role] = 5 WHERE [fileId] = @fileId AND [userId] = @userId
		SET @updated = @updated + @@ROWCOUNT

		UPDATE [dbo].[tblFilesUsers] SET [role] = 4 WHERE [fileId] = @fileId AND [userId] = @adminId
		SET @updated = @updated + @@ROWCOUNT
		
		SELECT @updated AS [n]
	COMMIT TRANSACTION

	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	ROLLBACK TRANSACTION
	RETURN 0
END CATCH
GO

-- Set8

-- Set9

PRINT 'Executing dbo.v1_Files_Update_Subscriber.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Update_Subscriber' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Update_Subscriber]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Update_Subscriber]
	@role INT,
	@fileId INT,
	@userId INT,
	@adminId INT
AS

SET NOCOUNT ON

BEGIN TRY
	DECLARE @updated INT = 0
	DECLARE @adminRole INT = 0

	SELECT TOP 1
		@adminRole = [role]
	FROM
		[dbo].[tblFilesUsers]
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @adminId

	IF (@@ROWCOUNT = 0)
	BEGIN
		SELECT 'You are not a user on this file!' AS [message], 503 AS [code]
		RETURN 0
	END

	IF (@adminRole < 5)
	BEGIN
		SELECT 'Only admins & owners can update file subscribers!' AS [message], 503 AS [code]
		RETURN 0
	END

	IF (@role >= 5)
	BEGIN
		SELECT 'You cannot change a user to an owner like this, use change owner!' AS [message], 503 AS [code]
		RETURN 0
	END

	UPDATE
		[dbo].[tblFilesUsers]
	SET
		[role] = @role
	WHERE
		[fileId] = @fileId
		AND
		[userId] = @userId

	SELECT @@ROWCOUNT AS [n]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- Set9