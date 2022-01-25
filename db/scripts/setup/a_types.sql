
IF (TYPE_ID (N'FILES') IS NULL)
    BEGIN
        CREATE TYPE [FILES] AS TABLE (
            [token] VARCHAR(32),
            [fileId] INT
        )
    END
