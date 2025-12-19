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
npm run dev
```


### Frontend

```bash
cd furgonat
npm install
npx expo start
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



##
Projekt i krijuar per te treguar dhe testuar aftesite e mia ne programim. Mund te kete momente qe kodi kerkon perditesim te librarive dhe versioneve te tyre, gje qe une i perditesoj here pas here. Faleminderit!

