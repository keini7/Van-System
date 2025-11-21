# 🔧 Quick Fix - Database Connection

## Problemi:
Health endpoint tregon: `"database": "disconnected"`

## Zgjidhja (3 hapa):

### Hapi 1: Start PostgreSQL (nëse nuk po funksionon)

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Hapi 2: Krijo Database dhe User

**Opsioni A: Me SQL script (RECOMMENDED)**

```bash
cd /home/keini/Desktop/Van-System/furgonat-backend
sudo -u postgres psql -f setup-db.sql
```

**Opsioni B: Manual**

```bash
sudo -u postgres psql
```

Pastaj kopjo dhe ekzekuto:

```sql
CREATE DATABASE furgonat;
CREATE USER furgonat_user WITH PASSWORD 'furgonat123';
GRANT ALL PRIVILEGES ON DATABASE furgonat TO furgonat_user;
\q
```

### Hapi 3: Ristarto Backend

```bash
cd /home/keini/Desktop/Van-System/furgonat-backend
npm run dev
```

## ✅ Verifikimi:

1. Health check: `http://localhost:5000/health`
   - Duhet të shohësh: `"database": "connected"`

2. Testo register: `POST http://localhost:5000/api/auth/register`
   - Duhet të funksionojë pa error

## ⚠️ Nëse vazhdon problemi:

Kontrollo `.env` file ka:
```env
DB_USER=furgonat_user
DB_PASS=furgonat123
DB_NAME=furgonat
DB_HOST=localhost
DB_PORT=5432
```

