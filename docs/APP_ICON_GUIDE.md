# App Icon Creation Guide

## 🎨 App Icon Requirements (512x512 PNG)

### Design Guidelines:
- **Size**: 512 x 512 pixels
- **Format**: PNG (no transparency for Play Store)
- **Style**: Material Design 3.0
- **Colors**: Primary brand colors
- **Content**: Simple, recognizable logo

### ThoHCM App Icon Concept:
```
Background: Gradient blue (#1976D2 to #42A5F5)
Icon: White wrench/hammer tools
Text: "THO" in bold white font
Border: Subtle rounded corners (8px radius)
```

### Tools to Create Icon:
1. **Canva**: https://canva.com (easy templates)
2. **Figma**: https://figma.com (professional design)
3. **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/
4. **GIMP**: Free alternative to Photoshop

### Icon Generator Script:
```html
<!-- Save as icon-template.html and open in browser -->
<!DOCTYPE html>
<html>
<head>
    <title>ThoHCM Icon Generator</title>
    <style>
        .icon {
            width: 512px;
            height: 512px;
            background: linear-gradient(135deg, #1976D2, #42A5F5);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            margin: 20px;
        }
        .content {
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 120px;
            font-weight: bold;
            font-family: 'Arial', sans-serif;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 24px;
            opacity: 0.9;
        }
        .tools {
            font-size: 80px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="icon">
        <div class="content">
            <div class="tools">🔧</div>
            <div class="logo">THO</div>
            <div class="subtitle">HCM</div>
        </div>
    </div>
    <p>Right-click the icon above and "Save image as..." to download</p>
</body>
</html>
```