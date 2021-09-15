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