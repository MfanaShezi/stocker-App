#!/bin/bash
# Wait for SQL Server to be ready
echo "Waiting for SQL Server to be ready..."
sleep 10

# Apply migrations
echo "Applying migrations..."
dotnet ef database update --assembly API.dll --verbose

# Start the application
echo "Starting application..."
exec dotnet API.dll