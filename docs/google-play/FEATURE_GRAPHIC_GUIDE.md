# Feature Graphic Creation Guide

## 🎨 Feature Graphic Requirements (1024x500)

### Technical Specs:
- **Size**: 1024 x 500 pixels
- **Format**: JPG or PNG
- **Purpose**: Main banner in Google Play Store
- **Visibility**: First thing users see

### Design Elements:
1. **Background**: Gradient or solid color matching brand
2. **App screenshots**: 2-3 phone mockups showing key features
3. **Logo/Branding**: App name and logo prominently displayed
4. **Text overlay**: Key value proposition
5. **Call-to-action**: Implied through design

## 🎯 ThoHCM Feature Graphic Concept

### Layout Structure:
```
Left Side (400px):
- Large app logo
- App name "ThoHCM"
- Tagline: "Thợ Skilled Workers On Demand"
- Subtitle: "Fast • Reliable • Verified"

Right Side (600px):
- 2 phone mockups showing:
  * Home screen with worker services
  * Booking confirmation screen
- Overlapping design for depth
```

### Color Scheme:
- **Primary**: #1976D2 (Blue)
- **Secondary**: #42A5F5 (Light Blue)
- **Accent**: #FFC107 (Amber for CTA)
- **Text**: White/Dark Gray

### HTML Template for Feature Graphic:
```html
<!DOCTYPE html>
<html>
<head>
    <title>ThoHCM Feature Graphic</title>
    <style>
        .feature-graphic {
            width: 1024px;
            height: 500px;
            background: linear-gradient(135deg, #1976D2, #42A5F5);
            position: relative;
            font-family: 'Arial', sans-serif;
            overflow: hidden;
        }
        .left-content {
            position: absolute;
            left: 50px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            z-index: 2;
        }
        .logo {
            font-size: 64px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 24px;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .features {
            font-size: 18px;
            opacity: 0.8;
        }
        .phones {
            position: absolute;
            right: 50px;
            top: 50%;
            transform: translateY(-50%);
        }
        .phone {
            width: 180px;
            height: 360px;
            background: #000;
            border-radius: 20px;
            margin: 0 10px;
            display: inline-block;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .phone-screen {
            width: 160px;
            height: 320px;
            background: white;
            border-radius: 15px;
            margin: 20px 10px;
            position: relative;
        }
    </style>
</head>
<body>
    <div class="feature-graphic">
        <div class="left-content">
            <div class="logo">🔧 ThoHCM</div>
            <div class="tagline">Skilled Workers On Demand</div>
            <div class="features">✓ Fast Service ✓ Reliable Workers ✓ Verified Professionals</div>
        </div>
        <div class="phones">
            <div class="phone">
                <div class="phone-screen"></div>
            </div>
            <div class="phone">
                <div class="phone-screen"></div>
            </div>
        </div>
    </div>
</body>
</html>
```