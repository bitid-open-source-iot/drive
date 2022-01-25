
/*
SET1 - CREATE STORED PROCEDURE FILE ADD
SET2 - CREATE STORED PROCEDURE FILE GET
SET3 - CREATE STORED PROCEDURE FILE ZIP
SET4 - CREATE STORED PROCEDURE FILE LIST
SET5 - CREATE STORED PROCEDURE FILE SHARE
SET6 - CREATE STORED PROCEDURE FILE UPDATE
SET7 - CREATE STORED PROCEDURE FILE DELETE
SET8 - CREATE STORED PROCEDURE FILE UNSUBSCRIBE
SET9 - CREATE STORED PROCEDURE FILE CHANGE OWNER
SET10 - CREATE STORED PROCEDURE FILE UPDATE SUBSCRIBER
*/

-- SET1

PRINT 'Executing dbo.v1_Files_Add.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Add' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Add]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Add]
	@name VARCHAR(255),
	@data VARCHAR(MAX),
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

-- SET1

-- SET2

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

-- SET2

-- SET3

PRINT 'Executing dbo.v1_Files_Zip.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Files_Zip' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Files_Zip]
END
GO

CREATE PROCEDURE [dbo].[v1_Files_Zip]
	@files FILES READONLY
AS

SET NOCOUNT ON

BEGIN TRY
	SELECT
		[a].[name],
		[a].[data],
		[a].[size],
		[a].[mimetype]
	FROM
		[dbo].[tblFiles] AS [a]
	INNER JOIN
		@files AS [b]
	ON
		[a].[id] = [b].[fileId]
		AND
		[a].[token] = [b].[token]

	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- SET3

-- SET4

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

-- SET4

-- SET5

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

-- SET5

-- SET6

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

-- SET6

-- SET7

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

-- SET7

-- SET8

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

-- SET8

-- SET9

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

-- SET9

-- SET10

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

-- SET10
/*
SET1 - CREATE STORED PROCEDURE ZIP ADD
SET2 - CREATE STORED PROCEDURE ZIP GET
SET3 - CREATE STORED PROCEDURE ZIP DELETE
*/

-- SET1

PRINT 'Executing dbo.v1_Zips_Add.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Zips_Add' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Zips_Add]
END
GO

CREATE PROCEDURE [dbo].[v1_Zips_Add]
	@data VARCHAR(MAX),
	@appId INT,
	@token VARCHAR(32),
	@userId INT
AS

SET NOCOUNT ON

BEGIN TRY
	INSERT INTO [dbo].[tblZips]
		(
			[data],
			[appId],
			[token],
			[userId]
		)
	VALUES
		(
			@data,
			@appId,
			@token,
			@userId
		)

	SELECT SCOPE_IDENTITY() AS [id], @token AS [token]
	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- SET1

-- SET2

PRINT 'Executing dbo.v1_Zips_Get.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Zips_Get' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Zips_Get]
END
GO

CREATE PROCEDURE [dbo].[v1_Zips_Get]
	@zipId INT,
	@token VARCHAR(32)
AS

SET NOCOUNT ON

BEGIN TRY
	IF NOT EXISTS (SELECT TOP 1 [id] FROM [dbo].[tblZips] WHERE [id] = @zipId AND [token] = @token)
	BEGIN
		SELECT 'No records found!' AS [message], 69 AS [code]
		RETURN 0
	END

	SELECT TOP 1
		*
	FROM
		[dbo].[tblZips]
	WHERE
		[id] = @zipId
		AND
		[token] = @token

	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- SET2

-- SET3

PRINT 'Executing dbo.v1_Zips_Delete.PRC'
GO

IF EXISTS (SELECT * FROM sys.objects WHERE name = 'v1_Zips_Delete' AND type = 'P')
BEGIN
	DROP PROCEDURE [dbo].[v1_Zips_Delete]
END
GO

CREATE PROCEDURE [dbo].[v1_Zips_Delete]
	@zipId INT,
	@token VARCHAR(32)
AS

SET NOCOUNT ON

BEGIN TRY
	DECLARE @deleted INT = 0

	DELETE
		[dbo].[tblZips]
	WHERE
		[id] = @zipId
		AND
		[token] = @token

	RETURN 1
END TRY

BEGIN CATCH
	SELECT Error_Message() AS [message], 503 AS [code]
	RETURN 0
END CATCH
GO

-- SET3