# Script kiểm tra xem credentials có bị commit vào Git history không
# PowerShell script for Windows

Write-Host "`n🔍 CHECKING CREDENTIALS IN GIT HISTORY...`n" -ForegroundColor Yellow

$credentialPatterns = @(
    "*firebase*key*.json",
    "*adminsdk*.json", 
    "*thohcm-application*.json",
    "*service-account*.json",
    "backend/config/*.json",
    "config/*.json"
)

$foundIssues = $false

Write-Host "Checking for sensitive files in Git history..." -ForegroundColor Cyan

foreach ($pattern in $credentialPatterns) {
    Write-Host "`nPattern: $pattern" -ForegroundColor Gray
    
    # Check if files matching pattern were ever committed
    $result = git log --all --oneline --name-only -- $pattern 2>$null | Select-String -Pattern "\.json$"
    
    if ($result) {
        $foundIssues = $true
        Write-Host "⚠️  FOUND in history!" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    } else {
        Write-Host "✅ Clean" -ForegroundColor Green
    }
}

Write-Host "`n`nChecking current Git status for ignored files..." -ForegroundColor Cyan

# Check current status
$statusResult = git status --ignored 2>&1 | Select-String -Pattern "(firebase|thohcm-application|service-account).*\.json"

if ($statusResult) {
    Write-Host "Files currently in working directory:" -ForegroundColor Gray
    Write-Host $statusResult -ForegroundColor Gray
}

Write-Host "`n`n📊 SUMMARY:`n" -ForegroundColor Yellow

if ($foundIssues) {
    Write-Host "❌ CREDENTIALS FOUND IN GIT HISTORY - ACTION REQUIRED!" -ForegroundColor Red
    Write-Host "`nYou need to:" -ForegroundColor Yellow
    Write-Host "1. Clean Git history using BFG or filter-branch" -ForegroundColor White
    Write-Host "2. Revoke old credentials on Firebase/GCP" -ForegroundColor White
    Write-Host "3. Generate new credentials" -ForegroundColor White
    Write-Host "`nSee SECURITY_FIX_CREDENTIALS.md for detailed instructions.`n" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ NO CREDENTIALS FOUND IN GIT HISTORY" -ForegroundColor Green
    Write-Host "`nYour .gitignore is working correctly!" -ForegroundColor Green
    Write-Host "Credentials are safe and never been committed.`n" -ForegroundColor Green
    exit 0
}
