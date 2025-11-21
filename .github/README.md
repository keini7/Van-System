# 📋 Checklist para se të push-osh në GitHub

## ✅ Para se të bësh commit:

1. **Kontrollo `.env` files:**
   - [ ] `.env` në `furgonat-backend/` është në `.gitignore`
   - [ ] `.env` në `furgonat/` (nëse ka) është në `.gitignore`
   - [ ] `.env.example` ose `env-template.txt` ekziston për referencë

2. **Kontrollo secrets:**
   - [ ] JWT_SECRET nuk është në kod
   - [ ] MongoDB credentials nuk janë hardcoded
   - [ ] API keys nuk janë në kod

3. **Kontrollo node_modules:**
   - [ ] `node_modules/` është në `.gitignore`
   - [ ] `package-lock.json` ose `yarn.lock` mund të lihet (opsional)

4. **Kontrollo build files:**
   - [ ] `dist/` dhe `build/` janë në `.gitignore`
   - [ ] `.expo/` është në `.gitignore`

5. **Kontrollo logs:**
   - [ ] `*.log` files janë në `.gitignore`

6. **Kontrollo IDE files:**
   - [ ] `.vscode/`, `.idea/` janë në `.gitignore`

7. **Kontrollo README:**
   - [ ] README.md është i përditësuar
   - [ ] Ka instruksione për setup
   - [ ] Ka përshkrim të projektit

## 🚀 Komandat për Git:

```bash
# Kontrollo status
git status

# Shto të gjitha file-t (përveç atyre në .gitignore)
git add .

# Bëj commit
git commit -m "Initial commit: Van System - React Native + Node.js"

# Shto remote (nëse nuk e ke)
git remote add origin https://github.com/username/van-system.git

# Push në GitHub
git push -u origin main
```

## ⚠️ Shënime:

- **MOS** pusho `.env` files
- **MOS** pusho `node_modules/`
- **MOS** pusho secrets ose API keys
- **MOS** pusho build files
- **PO** pusho `package.json` dhe `package-lock.json`
- **PO** pusho `env-template.txt` ose `.env.example`

