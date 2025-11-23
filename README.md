# 🔧 Thợ HCM - Home Repair Service Platform

<div align="center">
  <!-- Legacy web app removed. Logo asset relocated to new templates public folders. -->
  <img src="able-pro-material-react-ts-9.2.2/seed/public/favicon.png" alt="Thợ HCM Logo" width="120" height="120">
  
  **Professional Home Repair Services in Ho Chi Minh City**
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
  [![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white)](https://flutter.dev/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
</div>

## 📖 Overview

Thợ HCM is a comprehensive digital platform that connects customers with skilled technicians for electrical and refrigeration repair services in Ho Chi Minh City. Built with modern technologies, it provides seamless booking, real-time tracking, and efficient service management.

## 🌐 Frontend Migration (Able Pro React TS)

The legacy `web/` React client has been replaced and the folder removed in favor of the Able Pro Material React TypeScript templates:

- **Customer Web (Client)**: `able-pro-material-react-ts-9.2.2/seed` – lightweight version for end-users.
- **Admin Dashboard**: `able-pro-material-react-ts-9.2.2/full-version` – full feature set for internal management.

### Development

Open two terminals and run:

```pwsh
# Customer site
cd able-pro-material-react-ts-9.2.2/seed
yarn install
yarn start

# Admin dashboard
cd ../full-version
yarn install
yarn start
```

If you prefer npm, you may convert, but Yarn 4 (plug'n'play) is recommended for these workspaces.

### API Integration

Configure backend API base URL and Firebase in each app via `.env` and any custom service files (e.g. `src/services` once added). Add variables like:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=...
```

### Localization

Default language has been switched to Vietnamese (`vi`). Add translation message catalogs under `src/locales` (create folder) in both client and admin if not present. Fallback remains English.

### Deprecation

The old `web/` folder has been removed (see prior commit history for reference). Any remaining documentation references to `web/` are historical and will be cleaned progressively.

### Next Steps

1. Implement authentication flows against existing backend JWT endpoints.
2. Wire real-time Socket.IO notifications (use `VITE_SOCKET_URL`).
3. Map existing booking/service pages into corresponding Able Pro routes.
4. Introduce RBAC: restrict admin routes to `role=admin`.
5. Migrate any custom assets from `web/public` into the new apps' `public` folders.


### 🎯 Key Features

- **🏠 Customer Web Portal**: Easy service booking and management
- **📱 Worker Mobile App**: Flutter app for technicians with real-time updates
- **⚡ Real-time Communication**: Live booking updates using Socket.IO
- **💳 Payment Integration**: Secure payment processing
- **🌟 VIP Membership**: Premium services and priority booking
- **📊 Analytics Dashboard**: Comprehensive business insights
- **🗺️ Location Services**: GPS-based worker matching
- **⭐ Review System**: Customer feedback and ratings

## 📁 Project Structure

```
thohcm/
├── 📚 docs/                    # Documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── DEPLOYMENT_STATUS.md    # Current deployment status
│   ├── CLOUDRUN_MIGRATION.md   # Migration guide
│   └── MOBILE_TESTING_GUIDE.md # Mobile testing instructions
├── 🔧 scripts/                 # Automation scripts
│   ├── deploy-cloudrun.ps1     # Windows deployment
│   ├── deploy-cloudrun.sh      # Linux/macOS deployment
│   ├── run-worker-app.bat      # Windows mobile runner
│   ├── run-worker-app.ps1      # PowerShell mobile runner
│   └── set-env-vars.sh         # Environment setup
├── ⚙️ config/                  # Configuration files
│   ├── cloudbuild.yaml         # Cloud Build config
│   ├── connection-string-mongodb.txt # Database config
│   ├── FirebaseConfigObject.txt # Firebase config
│   └── thohcm-application-*.json # GCP service account
├── 🖥️ backend/                 # Node.js API server
├── (removed) web/              # Legacy React web application (deleted)
├── 📱 mobile/                  # Flutter mobile app
└── 📄 README.md                # This file
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Web Client    │    │   Mobile App    │    │   Admin Panel   │
│   (ReactJS)     │    │   (Flutter)     │    │   (ReactJS)     │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │                         │
                    │     Backend API         │
                    │   (Node.js/Express)     │
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │                         │
                    │      MongoDB            │
                    │   (Database)            │
                    │                         │
                    └─────────────────────────┘
```

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

### Frontend (Web)
- **ReactJS** with modern hooks
- **Vite** for build tooling
- **CSS3** with responsive design
- **Socket.IO Client** for real-time updates

### Mobile App
- **Flutter** for cross-platform development
- **Dart** programming language
- **HTTP** for API communication
- **Provider** for state management

### Database & Storage
- **MongoDB** for data persistence
- **File System** for image/document storage
- **Indexes** for optimized queries

## 📂 Project Structure

```
thohcm/
├── backend/                 # Node.js API Server
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── uploads/            # File storage
├── (removed) web/          # Legacy React application (deleted)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── utils/          # Client utilities
│   └── public/             # Static assets
├── mobile/
│   └── worker_app/         # Flutter mobile app
│       ├── lib/            # Dart source code
│       ├── android/        # Android configuration
│       ├── ios/            # iOS configuration
│       └── assets/         # App assets
└── docs/                   # Documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Flutter SDK (v3.0 or higher)
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/thohcm.git
cd thohcm/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if local)
mongod

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

### Frontend Setup (Customer & Admin)

```bash
# Customer (seed)
cd able-pro-material-react-ts-9.2.2/seed
npm install
npm run dev

# Admin (full-version)
cd ../full-version
npm install
npm run dev
```

See `docs/deployment/FRONTEND_MULTI_SITE_HOSTING.md` for multi-site hosting deployment.

### Mobile App Setup

```bash
cd ../mobile/worker_app

# Get Flutter dependencies
flutter pub get

# Run on Android emulator
flutter run

# Or run on specific device
flutter run -d <device_id>
```

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/thohcm

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=5242880

# Socket.IO (optional)
SOCKET_CORS_ORIGIN=http://localhost:3000
```

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Booking Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Service Endpoints
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (admin)

### User Management
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/upload-avatar` - Upload avatar

## 🔄 Real-time Features

The application uses Socket.IO for real-time communication:

- **Booking Updates**: Live status changes
- **Worker Location**: Real-time tracking
- **Notifications**: Instant messaging
- **Admin Dashboard**: Live metrics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Web client tests
cd ../web
npm test

# Mobile app tests
cd ../mobile/worker_app
flutter test
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment (Firebase Multi-Site)
Refer to `docs/deployment/FRONTEND_MULTI_SITE_HOSTING.md`.
Key command after builds:
```bash
firebase deploy --only hosting:customer,hosting:admin --project thohcm-frontend
```

### Mobile App Deployment
```bash
# Build APK for Android
flutter build apk --release

# Build iOS app
flutter build ios --release
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Hoang Thai
- **Project Type**: Full-stack Development
- **Duration**: 2024 - Present

## 📞 Contact

- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Special thanks to the Flutter and React communities
- Inspired by modern service platforms like Grab and Lalamove

---

<div align="center">
  <p>Made with ❤️ in Ho Chi Minh City</p>
  <p>© 2024 Thợ HCM. All rights reserved.</p>
</div>