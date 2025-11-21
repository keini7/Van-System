# Van System

Sistem për rezervimin e furgonave. Ka dy lloje përdoruesish: user i thjeshtë që rezervon vende dhe van manager që menaxhon furgonat dhe orarët e tyre.

## Çfarë ka

- Frontend: React Native me Expo (iOS, Android)
- Backend: Node.js + Express + TypeScript + MongoDB

## Si ta nisesh

### Backend

```bash
cd furgonat-backend
npm install
cp env-template.txt .env
# Edito .env dhe vendos MongoDB URI dhe JWT_SECRET
npm run dev
```

Serveri niset në `http://localhost:5000`

### Frontend

```bash
cd furgonat
npm install
npm start
```

Pastaj hap me Expo Go në telefon ose simulator.

## Tipet e përdoruesve

**User i thjeshtë:**
- Regjistrohet dhe login
- Shikon destinacionet e disponueshme
- Rezervon vende për udhëtime
- Shikon dhe anulon rezervimet e veta

**Van Manager:**
- Regjistrohet si manager (duhet targa e furgonit)
- Shton furgonat e veta me foto
- Krijon orarë fikse për destinacione (p.sh. çdo ditë në 6:00 për Tirana)
- Shikon rezervimet për furgonat e veta

## Si funksionon

- Manager-i krijon orarë fikse për destinacione
- Sistem gjeneron automatikisht routes për 7 ditët e ardhshme nga orarët aktive
- User-i shikon routes dhe rezervon vende
- Routes që kanë kaluar ose janë plot fshihen automatikisht nga lista

## Teknologji

**Frontend:**
- React Native, Expo SDK 54
- React Navigation, Context API
- AsyncStorage për token storage

**Backend:**
- Node.js, Express, TypeScript
- MongoDB me Mongoose
- JWT për authentication

## Struktura

```
Van-System/
├── furgonat/              # Frontend
│   └── src/
│       ├── screens/       # Ekrane (auth, dashboard)
│       ├── context/       # Auth, Theme, Settings
│       └── components/    # Komponente
│
└── furgonat-backend/      # Backend
    └── src/
        ├── controllers/   # Business logic
        ├── models/        # MongoDB models
        ├── routes/        # API routes
        └── middleware/    # Auth, error handling
```

## API

Backend ka dokumentacion Swagger në `http://localhost:5000/docs` pasi të niset serveri.

Endpoints kryesore:
- `/api/auth/register` - Regjistrim
- `/api/auth/login` - Login
- `/api/user/routes` - Destinacione për user
- `/api/manager/vans` - Menaxhim furgonash
- `/api/manager/schedules` - Menaxhim orarësh

## Database

Përdor MongoDB. Baza e të dhënave krijohet automatikisht kur lidhja me MongoDB është e suksesshme.

Collections:
- `users` - Përdoruesit
- `vans` - Furgonat
- `schedules` - Orarët fikse
- `routes` - Routes për ditë specifike
- `bookings` - Rezervimet

## Shënime

- Origin është fiksuar në "Pogradec"
- Ora e nisjes duhet të jetë ndërmjet 05:00 dhe 18:00
- Routes krijohen automatikisht nga schedules aktive
- Routes që kanë kaluar ose janë plot fshihen nga lista
