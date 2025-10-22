# Get SHA-1 Fingerprint cho Firebase
Write-Host "🔐 Getting SHA-1 Fingerprint for Firebase..." -ForegroundColor Green

$appPath = "D:\Thai\root\ThoHCM\mobile\worker_app"
Set-Location $appPath

Write-Host "`n📍 Getting Debug SHA-1 (for development):" -ForegroundColor Yellow

# Windows default debug keystore location
$debugKeystore = "$env:USERPROFILE\.android\debug.keystore"

if (Test-Path $debugKeystore) {
    Write-Host "✅ Debug keystore found: $debugKeystore" -ForegroundColor Green
    
    Write-Host "`n🔧 Running keytool command..." -ForegroundColor Yellow
    Write-Host "Command: keytool -list -v -alias androiddebugkey -keystore `"$debugKeystore`"" -ForegroundColor Cyan
    
    try {
        # Run keytool with default debug password
        $output = keytool -list -v -alias androiddebugkey -keystore "$debugKeystore" -storepass android -keypass android 2>&1
        
        # Extract SHA-1
        $sha1Line = $output | Select-String "SHA1:"
        if ($sha1Line) {
            $sha1 = ($sha1Line.ToString() -split "SHA1: ")[1].Trim()
            Write-Host "`n✅ Debug SHA-1 Fingerprint:" -ForegroundColor Green
            Write-Host "$sha1" -ForegroundColor Cyan
            
            Write-Host "`n📋 Copy SHA-1 này và paste vào Firebase Console:" -ForegroundColor Yellow
            Write-Host "1. Go to Firebase Console > Project Settings" -ForegroundColor White
            Write-Host "2. Select 'ThoHCM Worker App'" -ForegroundColor White
            Write-Host "3. Click 'Add fingerprint'" -ForegroundColor White
            Write-Host "4. Paste SHA-1: $sha1" -ForegroundColor White
            Write-Host "5. Save" -ForegroundColor White
            
            # Save to clipboard if possible
            try {
                $sha1 | Set-Clipboard
                Write-Host "`n📎 SHA-1 đã được copy vào clipboard!" -ForegroundColor Green
            } catch {
                Write-Host "`n⚠️  Không thể copy vào clipboard, hãy copy thủ công" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "`n❌ Không tìm thấy SHA-1 trong output" -ForegroundColor Red
            Write-Host "Raw output:" -ForegroundColor Yellow
            Write-Host $output
        }
        
    } catch {
        Write-Host "`n❌ Lỗi khi chạy keytool: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n💡 Hãy chạy command này manually:" -ForegroundColor Yellow
        Write-Host "keytool -list -v -alias androiddebugkey -keystore `"$debugKeystore`" -storepass android -keypass android" -ForegroundColor Cyan
    }
    
} else {
    Write-Host "❌ Debug keystore không tìm thấy tại: $debugKeystore" -ForegroundColor Red
    Write-Host "`n💡 Có thể ở vị trí khác. Hãy chạy Flutter app một lần để generate debug keystore" -ForegroundColor Yellow
    Write-Host "flutter run --debug" -ForegroundColor Cyan
}

Write-Host "`n📝 Lưu ý:" -ForegroundColor Yellow
Write-Host "- Debug SHA-1: Dùng cho development/testing" -ForegroundColor White
Write-Host "- Release SHA-1: Cần tạo khi có production keystore" -ForegroundColor White
Write-Host "- Cả hai đều cần add vào Firebase để app hoạt động đúng" -ForegroundColor White