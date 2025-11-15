# Proiect-Tehnologii-Web-Spark
# Continuous Feedback App

## Obiectiv
Realizarea unei aplicații web care să permită acordarea de punctaje anonime de către un juriu anonim de studenți pentru proiectul altor studenți.

---

## Tehnologii Folosite
- **Frontend (SPA):** React.js  
- **Backend (API):** Node.js + Express.js  
- **Bază de Date:** PostgreSQL  
- **ORM:** Sequelize  
- **Comunicare Live:** WebSockets  
- **Versionare:** Git  

---

## Funcționalități Cheie

### Student (creator / evaluator)
- Adaugă proiecte și livrabile  
- Atașează link sau video demonstrativ pentru proiect  
- Acces rapid la proiectele pentru care este selectat evaluator  
- Acordă note anonime (1-10, cu până la 2 zecimale) doar în perioada permisă  
- Vizualizează media finală a proiectului (fără a vedea identitatea evaluatorilor)  

---

## Flux de evaluare proiect

1. **Student MP** adaugă proiect și livrabile.  
2. Sistemul selectează **aleatoriu membri ai juriului** pentru fiecare livrabil.  
3. **Evaluatorii** acordă note anonime doar în perioada definită.  
4. Media finală este calculată **omitând nota cea mai mare și cea mai mică**.  

---

## Modelul de Date

### profil
- `profil_id` (PK)  
- `nume_utilizator`  
- `tip` (MP / evaluator)  
- `email`  
- `parola`  

### proiect
- `proiect_id` (PK)  
- `creator_id` (FK → profil)  
- `titlu`  
- `descriere`  

### livrabil
- `livrabil_id` (PK)  
- `proiect_id` (FK → proiect)  
- `titlu`  
- `video_link` / `server_link`  
- `data_livrabil`  

### juriu
- `jury_id` (PK)  
- `livrabil_id` (FK → livrabil)  
- `student_id` (FK → profil)  

### nota
- `nota_id` (PK)  
- `jury_id` (FK → juriu)  
- `valoare` (decimal, 1-10)  
- `creata_la`  

## Modelul de Date - Profil - Cod - Activitate - Feedback

## Obiectiv: Realizarea unei aplicații web care să permită acordarea de punctaje anonime de către un juriu anonim de studenți pentru proiectul altor studenți.
