# ✅ Pre-Commit Checklist

Para se të bësh commit dhe push në GitHub, kontrollo këto:

## 🔒 Security Check

- [ ] **`.env` files nuk janë në commit:**
  ```bash
  git status | grep .env
  # Nuk duhet të shfaqë asnjë .env file
  ```

- [ ] **Secrets nuk janë hardcoded:**
  - [ ] JWT_SECRET nuk është në kod
  - [ ] MongoDB credentials nuk janë në kod
  - [ ] API keys nuk janë në kod

## 📦 Dependencies

- [ ] **`node_modules/` nuk është në commit:**
  ```bash
  git status | grep node_modules
  # Nuk duhet të shfaqë asgjë
  ```

- [ ] **`package.json` dhe `package-lock.json` janë në commit** (opsional, por rekomandohet)

## 🏗️ Build Files

- [ ] **Build files nuk janë në commit:**
  - [ ] `dist/` nuk është në commit
  - [ ] `build/` nuk është në commit
  - [ ] `.expo/` nuk është në commit

## 📝 Documentation

- [ ] **README.md është i përditësuar:**
  - [ ] Ka instruksione për setup
  - [ ] Ka përshkrim të projektit
  - [ ] Ka informacion për teknologjitë

- [ ] **`.env.example` ose `env-template.txt` ekziston** për referencë

## 🧪 Testing

- [ ] **Kodi kompajlohet pa gabime:**
  ```bash
  # Backend
  cd furgonat-backend && npm run build
  
  # Frontend (nëse ka build script)
  cd furgonat && npm run build
  ```

## 🚀 Komandat për Git

```bash
# 1. Kontrollo status
git status

# 2. Shiko çfarë do të commit-osh
git diff --cached

# 3. Nëse gjithçka është në rregull, bëj commit
git commit -m "Your commit message"

# 4. Push në GitHub
git push origin main
```

## ⚠️ Nëse ke commit-uar .env me gabim:

```bash
# 1. Hiq .env nga commit (por mos e fshi nga disk)
git rm --cached furgonat-backend/.env

# 2. Bëj commit
git commit -m "Remove .env from git"

# 3. Push
git push origin main

# 4. Ndrysho JWT_SECRET në production sepse është ekspozuar!
```

