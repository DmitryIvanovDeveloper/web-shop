# Sync WebShopX documentation
param(
    [string]$SourcePath = "J:\Общие диски\WebShopX",
    [string]$DestinationPath = "H:\Work\AI\webshops-specs\docs"
)

Write-Host "Starting documentation sync..." -ForegroundColor Green
Write-Host "Source: $SourcePath" -ForegroundColor Yellow
Write-Host "Destination: $DestinationPath" -ForegroundColor Yellow

# Check if source exists
if (-not (Test-Path $SourcePath)) {
    Write-Host "Error: Source path not found: $SourcePath" -ForegroundColor Red
    Write-Host "Trying alternative paths..." -ForegroundColor Yellow
    
    # Try alternative paths
    $possiblePaths = @(
        "J:\Общие диски\WebShopX",
        "G:\My Drive\WebShopX",
        "C:\Users\$env:USERNAME\Google Drive\WebShopX"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $SourcePath = $path
            Write-Host "Found alternative path: $SourcePath" -ForegroundColor Green
            break
        }
    }
}

if (-not (Test-Path $SourcePath)) {
    Write-Host "Could not find WebShopX source folder" -ForegroundColor Red
    exit 1
}

# Create destination if not exists
if (-not (Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
    Write-Host "Created destination folder: $DestinationPath" -ForegroundColor Green
}

# Perform sync using robocopy
try {
    Write-Host "Performing sync..." -ForegroundColor Cyan
    
    # Use cmd to avoid PowerShell encoding issues
    $cmdArgs = "robocopy `"$SourcePath`" `"$DestinationPath`" /E /XO /R:3 /W:1 /NFL /NDL /NJH /NJS /NC /NS /NP"
    
    $result = cmd /c $cmdArgs
    
    Write-Host "Sync completed!" -ForegroundColor Green
    
} catch {
    Write-Host "Error during sync: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "WebShopX documentation sync completed successfully!" -ForegroundColor Green