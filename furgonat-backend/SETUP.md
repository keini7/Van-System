# 🚀 Setup Guide - Furgonat Backend (MongoDB)

## Hapi 1: Instalo MongoDB

```bash
sudo apt-get update
sudo apt-get install mongodb
```

## Hapi 2: Start MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Hapi 3: Konfiguro .env

Krijo `.env` file:
```bash
cp env-template.txt .env
```

`.env` duhet të ketë:
```env
MONGODB_URI=mongodb://localhost:27017/furgonat
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

**Shënim:** MongoDB krijo database automatikisht - nuk ka nevojë për setup manual!

## Hapi 4: Nis Backend

```bash
npm run dev
```

## ✅ Çfarë do të ndodhë:

1. Backend do të lidhet me MongoDB
2. Collections do të krijohen automatikisht kur përdoren
3. Server do të niset në `http://localhost:5000`

## 🔍 Verifikimi:

- Health check: `http://localhost:5000/health`
  - Duhet të shohësh: `"database": "connected"`
- API Docs: `http://localhost:5000/docs`
- API IP: `http://localhost:5000/api/config/ip`

## ⚠️ Nëse ka error:

Backend do të tregojë mesazhe të qarta për çfarë duhet rregulluar. Shiko console output për instruksione specifike.

## 💡 Avantazhet e MongoDB:

- ✅ Nuk ka nevojë për migrations
- ✅ Collections krijohen automatikisht
- ✅ Schema fleksibël
- ✅ Setup më i thjeshtë
