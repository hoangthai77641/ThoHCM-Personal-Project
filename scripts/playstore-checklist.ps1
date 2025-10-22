# Google Play Store Deployment Checklist
Write-Host "📱 Google Play Store Deployment Guide" -ForegroundColor Green

Write-Host "`n🔍 PRE-DEPLOYMENT CHECKLIST:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

Write-Host "`n1. 🔐 SIGNING & SECURITY:" -ForegroundColor Cyan
Write-Host "   ✅ Production keystore created (thohcm-key.jks)" -ForegroundColor White
Write-Host "   ✅ Signed APK/AAB with production key" -ForegroundColor White
Write-Host "   ✅ SHA1 fingerprint added to Firebase" -ForegroundColor White
Write-Host "   ⚠️  Keep keystore file SECURE - nếu mất sẽ không thể update app!" -ForegroundColor Red

Write-Host "`n2. 📦 APP BUNDLE (RECOMMENDED):" -ForegroundColor Cyan
Write-Host "   📝 Build AAB instead of APK: flutter build appbundle --release" -ForegroundColor White
Write-Host "   📝 AAB file smaller, better optimization by Google" -ForegroundColor White

Write-Host "`n3. 📄 REQUIRED MATERIALS:" -ForegroundColor Cyan
Write-Host "   📝 App icon (512x512 PNG)" -ForegroundColor White
Write-Host "   📝 Feature graphic (1024x500 PNG)" -ForegroundColor White
Write-Host "   📝 Screenshots (phone, tablet if applicable)" -ForegroundColor White
Write-Host "   📝 App description (Vietnamese + English)" -ForegroundColor White
Write-Host "   📝 Privacy Policy URL (REQUIRED)" -ForegroundColor White

Write-Host "`n4. 🏪 GOOGLE PLAY CONSOLE:" -ForegroundColor Cyan
Write-Host "   📝 Developer account ($25 one-time fee)" -ForegroundColor White
Write-Host "   📝 Tax and banking information" -ForegroundColor White
Write-Host "   📝 Content rating questionnaire" -ForegroundColor White

Write-Host "`n5. 🔒 COMPLIANCE:" -ForegroundColor Cyan
Write-Host "   📝 Target SDK 34+ (current requirement)" -ForegroundColor White
Write-Host "   📝 Privacy Policy compliant" -ForegroundColor White
Write-Host "   📝 Data safety section filled" -ForegroundColor White
Write-Host "   📝 App content rating" -ForegroundColor White

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "1. Create production keystore" -ForegroundColor White
Write-Host "2. Build signed AAB" -ForegroundColor White
Write-Host "3. Setup Google Play Console" -ForegroundColor White
Write-Host "4. Upload and configure app" -ForegroundColor White
Write-Host "5. Submit for review" -ForegroundColor White