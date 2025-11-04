# Thợ HCM Shared Package

Shared code between Customer App and Worker App.

## Contents

### Core
- API Client with JWT authentication
- App Theme (Light/Dark modes)
- Constants and Environment config
- Localization strings

### Models
- User, Booking, Service, Review, Notification

### Services
- Firebase Messaging
- Local Notifications
- Socket.IO real-time communication

### Providers
- Authentication Provider
- Socket Provider

### Widgets
- Reusable UI components

### Utils
- Validators, Formatters, Helpers

## Usage

Add to your app's `pubspec.yaml`:

```yaml
dependencies:
  tho_hcm_shared:
    path: ../packages/tho_hcm_shared
```

Then import:

```dart
import 'package:tho_hcm_shared/tho_hcm_shared.dart';
```
