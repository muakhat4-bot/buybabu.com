# =========================================================================
# Villex Automated Backup Script (PowerShell)
# =========================================================================
# This script creates a timestamped backup of:
# 1. Environment Configurations (.env files)
# 2. Database schema/content using pg_dump (if available)
# 3. Storage structures description
# =========================================================================

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $PSScriptRoot "..\backups\backup-$timestamp"

Write-Host "Creating backup directory: $backupDir..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# -------------------------------------------------------------------------
# 1. Backup Environment Configuration
# -------------------------------------------------------------------------
Write-Host "Backing up Environment Configuration..." -ForegroundColor Cyan
$envDest = Join-Path $backupDir "config"
New-Item -ItemType Directory -Force -Path $envDest | Out-Null

$envFiles = @(
    @{ Path = "..\.env"; Name = "root.env" },
    @{ Path = "..\apps\admin-portal\.env"; Name = "admin-portal.env" },
    @{ Path = "..\apps\api-server\.env"; Name = "api-server.env" },
    @{ Path = "..\apps\customer-marketplace\.env"; Name = "customer-marketplace.env" },
    @{ Path = "..\apps\vendor-portal\.env"; Name = "vendor-portal.env" }
)

foreach ($file in $envFiles) {
    $srcPath = Resolve-Path (Join-Path $PSScriptRoot $file.Path) -ErrorAction SilentlyContinue
    if ($srcPath) {
        $destPath = Join-Path $envDest $file.Name
        Copy-Item -Path $srcPath -Destination $destPath -Force
        Write-Host "  Copying: $($file.Path) -> $($file.Name)"
    } else {
        Write-Warning "  Skipping (Not Found): $($file.Path)"
    }
}

# -------------------------------------------------------------------------
# 2. Backup PostgreSQL Database (Supabase / Local)
# -------------------------------------------------------------------------
Write-Host "Backing up PostgreSQL Database..." -ForegroundColor Cyan

# Attempt to load DATABASE_URL from root .env
$rootEnvPath = Resolve-Path (Join-Path $PSScriptRoot "..\.env") -ErrorAction SilentlyContinue
$dbUrl = ""
if ($rootEnvPath) {
    $lines = Get-Content $rootEnvPath
    foreach ($line in $lines) {
        if ($line -match "^DATABASE_URL\s*=\s*`"(.*)`"") {
            $dbUrl = $Matches[1]
        } elseif ($line -match "^DATABASE_URL\s*=\s*(.*)") {
            $dbUrl = $Matches[1]
        }
    }
}

if ($dbUrl) {
    $dbBackupPath = Join-Path $backupDir "database_backup.sql"
    Write-Host "  Found DATABASE_URL. Attempting pg_dump export..."
    
    # Check if pg_dump is available in path
    $pgDumpExists = Get-Command pg_dump -ErrorAction SilentlyContinue
    if ($pgDumpExists) {
        try {
            # Execute pg_dump
            pg_dump $dbUrl -f $dbBackupPath
            Write-Host "  Database dump saved to: database_backup.sql" -ForegroundColor Green
        } catch {
            Write-Error "  Failed to execute pg_dump: $_"
        }
    } else {
        Write-Warning "  pg_dump utility not found in PATH. To enable automatic db dumps, install PostgreSQL client tools locally."
        Write-Host "  Saving connection details to connection_details.txt instead."
        Set-Content -Path (Join-Path $backupDir "connection_details.txt") -Value "DATABASE_URL: $dbUrl"
    }
} else {
    Write-Warning "  DATABASE_URL was not found in root .env file. Skipping database dump."
}

# -------------------------------------------------------------------------
# 3. Backup Storage Files (Supabase / Local)
# -------------------------------------------------------------------------
Write-Host "Backing up Storage configuration details..." -ForegroundColor Cyan
$storageLog = @"
Storage Backup Log - $timestamp
======================================================
The file storage is hosted on Supabase Storage.
To perform a complete file backup, use the Supabase CLI:
supabase storage pull product-images ./storage-backup/product-images
supabase storage pull product-gallery ./storage-backup/product-gallery
supabase storage pull vendor-logos ./storage-backup/vendor-logos
supabase storage pull vendor-banners ./storage-backup/vendor-banners
supabase storage pull customer-avatars ./storage-backup/customer-avatars
"@
Set-Content -Path (Join-Path $backupDir "storage_backup_instructions.txt") -Value $storageLog

Write-Host "Backup completed successfully! Files saved to: $backupDir" -ForegroundColor Green
