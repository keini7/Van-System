# Backend - Van System

Backend API për sistemin e rezervimit të furgonave.

## Quick Start

1. Instalo dependencies:
```bash
npm install
```

2. Krijo `.env` file (kopjo nga `env-template.txt` ose krijo manualisht):
```bash
# Nëse ke env-template.txt lokal, kopjoje:
cp env-template.txt .env

# Ose krijo manualisht .env me këto variabla:
```

3. Konfiguro `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/furgonat
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Nis MongoDB (nëse është lokale):
```bash
mongod
```

5. Nis serverin:
```bash
npm run dev
```

Serveri niset në `http://localhost:5000`

## API Documentation

Pas nisjes së serverit, dokumentacioni Swagger është i disponueshëm në:
`http://localhost:5000/docs`

## Database

Përdor MongoDB. Baza e të dhënave krijohet automatikisht kur lidhja me MongoDB është e suksesshme.

Collections krijohen automatikisht kur përdoren për herë të parë.

## Authentication

Të gjitha routes përveç `/api/auth/*` kërkojnë JWT token në header:
```
Authorization: Bearer <token>
```

## Scripts

- `npm run dev` - Nis serverin në development mode me auto-reload
- `npm run build` - Kompajlon TypeScript në JavaScript
- `npm start` - Nis serverin nga build i kompajluar

## Struktura

```
src/
├── config/          # Database, Swagger configuration
├── controllers/     # Business logic
├── middleware/      # Auth, Error handling, Role checking
├── models/          # MongoDB schemas
├── routes/          # API route definitions
└── utils/           # Helper functions (JWT, Hash, Network IP)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PORT` | Server port | No (default: 5000) |
| `JWT_SECRET` | Secret për JWT tokens | Yes |
| `NODE_ENV` | Environment (development/production) | No |
