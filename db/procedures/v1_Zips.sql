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