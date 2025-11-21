# 🚐 Van System - Sistem i Rezervimit të Furgonave

Sistem i plotë për menaxhimin dhe rezervimin e furgonave për udhëtime nga Pogradec në destinacione të ndryshme.

## 📋 Përshkrimi

Ky projekt përbëhet nga:
- **Frontend**: React Native aplikacion me Expo (iOS, Android, Web)
- **Backend**: Node.js + Express + TypeScript + MongoDB

## 🏗️ Struktura e Projektit

```
Van-System/
├── furgonat/                 # Frontend (React Native / Expo)
│   ├── src/
│   │   ├── components/       # Komponente të ri-utilizueshme
│   │   ├── config/          # Konfigurime (API endpoints)
│   │   ├── context/         # Context providers (Auth, Theme)
│   │   ├── routes/          # Route definitions
│   │   └── screens/         # Ekrane të aplikacionit
│   │       ├── auth/        # Login, Register, Welcome
│   │       └── dashboard/   # User & Manager Dashboards
│   ├── App.js
│   ├── package.json
│   └── app.json
│
├── furgonat-backend/         # Backend (Node.js / Express / TypeScript)
│   ├── src/
│   │   ├── config/          # Database, Swagger config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, Error handling
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Helper functions
│   ├── env-template.txt     # Template për .env
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Setup dhe Instalim

### Kërkesat
- Node.js (v18 ose më i lartë)
- MongoDB (lokale ose MongoDB Atlas)
- Expo CLI (për frontend)

### Backend Setup

1. Shko në direktorinë e backend:
```bash
cd furgonat-backend
```

2. Instalo dependencies:
```bash
npm install
```

3. Krijo `.env` file (kopjo nga `env-template.txt`):
```bash
cp env-template.txt .env
```

4. Konfiguro `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/furgonat
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

5. Nis serverin:
```bash
npm run dev
```

Backend do të ekzekutohet në `http://localhost:5000`

### Frontend Setup

1. Shko në direktorinë e frontend:
```bash
cd furgonat
```

2. Instalo dependencies:
```bash
npm install
```

3. Nis aplikacionin:
```bash
npm start
```

Ose për platform specifike:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## 🔐 Tipet e Përdoruesve

### 1. User i thjeshtë
- Regjistrohet dhe login
- Shikon destinacionet e disponueshme
- Rezervon vende për udhëtime
- Shikon rezervimet e veta
- Anulon rezervime

### 2. Van Manager
- Regjistrohet si manager
- Shton furgonat e veta
- Krijon orarë fikse për destinacione
- Shikon rezervimet për furgonat e veta
- Menaxhon statusin e orareve

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Regjistrim
- `POST /api/auth/login` - Login

### User Endpoints
- `GET /api/user/dashboard` - Dashboard i user-it
- `GET /api/user/routes` - Destinacione të disponueshme
- `GET /api/user/bookings` - Rezervimet e user-it
- `POST /api/user/bookings` - Krijo rezervim
- `PUT /api/user/bookings/:id/cancel` - Anulo rezervim

### Manager Endpoints
- `GET /api/manager/dashboard` - Dashboard i manager-it
- `GET /api/manager/vans` - Lista e furgonave
- `POST /api/manager/vans` - Krijo furgon të ri
- `GET /api/manager/schedules` - Lista e orareve
- `POST /api/manager/schedules` - Krijo orar të ri
- `PUT /api/manager/schedules/:id` - Edito orar
- `PUT /api/manager/schedules/:id/toggle` - Aktivizo/Deaktivizo orar
- `POST /api/manager/schedules/:id/create-route` - Krijo route nga orar
- `GET /api/manager/bookings` - Rezervimet për furgonat e manager-it

## 🗄️ Database Schema

### User
- email, password, role (user/manager)
- firstName, lastName, phone

### Van
- plateNumber, vanModel, capacity
- manager (reference)

### Schedule
- van, manager, destination
- departureTime, arrivalTime, price
- daysOfWeek, isActive, totalSeats

### Route
- origin, destination, date
- departureTime, arrivalTime, price
- van, manager, availableSeats, totalSeats
- status (scheduled/completed/cancelled)

### Booking
- user, route, van, manager
- numberOfSeats, totalPrice
- status (pending/confirmed/cancelled)

## 🔧 Teknologjitë e Përdorura

### Frontend
- React Native
- Expo SDK 54
- React Navigation
- AsyncStorage
- Context API
- DateTimePicker

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt
- CORS

## 📝 Shënime

- Orarët fikse krijojnë automatikisht routes për 7 ditët e ardhshme
- Origin është fiksuar në "Pogradec"
- Ora e nisjes duhet të jetë ndërmjet 05:00 dhe 18:00
- Routes krijohen automatikisht nga schedules aktive kur user-i kërkon destinacione

## 📄 License

MIT

## 👤 Autor

Projekt i krijuar për menaxhimin e rezervimeve të furgonave.
