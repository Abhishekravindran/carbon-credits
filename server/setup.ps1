# Check if MongoDB is installed
$mongoPath = "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
if (-not (Test-Path $mongoPath)) {
    Write-Host "MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
    Write-Host "After installation, run this script again."
    exit
}

# Create data directory if it doesn't exist
$dataPath = "C:\data\db"
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force
}

# Start MongoDB
Write-Host "Starting MongoDB..."
Start-Process -FilePath $mongoPath -ArgumentList "--dbpath", $dataPath

# Install npm dependencies
Write-Host "Installing npm dependencies..."
npm install

Write-Host "Setup complete! You can now run 'npm run dev' to start the server." 