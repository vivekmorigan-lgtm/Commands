# PowerShell script to update package.json version based on commit count
$ErrorActionPreference = 'Stop'

# Get the path to package.json (assume script is in Commands/)
$pkgPath = Join-Path $PSScriptRoot '..' 'package.json'
$pkgPath = [System.IO.Path]::GetFullPath($pkgPath)

if (-not (Test-Path $pkgPath)) {
    Write-Host "package.json not found at $pkgPath"
    exit 1
}

# Get commit count
git -C (Split-Path $pkgPath) rev-list --count HEAD 2>$null | ForEach-Object {
    $commits = [int]$_
    $minor = [math]::Floor($commits / 10)
    $patch = $commits % 10
    $version = "0.$minor.$patch"

    # Read and update package.json
    $pkg = Get-Content $pkgPath | Out-String | ConvertFrom-Json
    if ($pkg.version -ne $version) {
        $pkg.version = $version
        $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8
        git -C (Split-Path $pkgPath) add $pkgPath
        Write-Host "Updated package.json version to $version"
    } else {
        Write-Host "package.json version already up to date ($version)"
    }
}
