const express = require("express");
const cors = require("cors");
const sequelize = require("./sequelize");
const { Op } = require("sequelize");

const Profil = require("./models/Profil");
const Proiect = require("./models/Proiect");
const Livrabil = require("./models/Livrabil");
const Juriu = require("./models/Juriu");
const Nota = require("./models/Nota");

const app = express();

// CONFIGURARE MIDDLEWARE
app.use(cors()); // Permite cererile de la React 
app.use(express.json());

// RUTA DE TEST (pentru a vedea dacă serverul răspunde)
app.get("/", (req, res) => {
    res.send("Serverul este pornit pe portul 5001!");
});

// --- RUTE UTILIZATORI ---
app.post("/register", async (req, res) => {
    try {
        const profil = await Profil.create(req.body);
        res.status(201).json(profil);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- RUTE PROIECTE & LIVRABILE ---
app.get("/projects", async (req, res) => {
    try {
        // Ca sa putem afisa rezultatele (media pe livrabil) in frontend,
        // returnam si livrabilele asociate fiecarui proiect.
        const proiecte = await Proiect.findAll({ include: [Profil, Livrabil] });
        res.json(proiecte);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/projects", async (req, res) => {
    try {
        const proiect = await Proiect.create(req.body);
        res.status(201).json(proiect);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/deliverables", async (req, res) => {
    try {
        const liv = await Livrabil.create(req.body);
        const proiect = await Proiect.findByPk(req.body.proiect_id);

        if (!proiect) {
            return res.status(400).json({ error: "Proiect inexistent pentru acest proiect_id." });
        }

        // Alocare AUTOMATĂ juriu (3 studenți la întâmplare care nu sunt creatorii)
        const potentiali = await Profil.findAll({
            where: { profil_id: { [Op.ne]: proiect.creator_id } }
        });

        if (potentiali.length > 0) {
            const selectati = potentiali.sort(() => 0.5 - Math.random()).slice(0, 3);
            for (let s of selectati) {
                await Juriu.create({ livrabil_id: liv.livrabil_id, student_id: s.profil_id });
            }
        }
        res.status(201).json(liv);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- RUTE EVALUARE (JURIU & NOTE) ---
app.get("/my-tasks/:student_id", async (req, res) => {
    try {
        const tasks = await Juriu.findAll({
            where: { student_id: req.params.student_id },
            include: [{ model: Livrabil, include: [Proiect] }]
        });
        res.json(tasks);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/grades", async (req, res) => {
    try {
        const { student_id, livrabil_id, valoare } = req.body;
        const membru = await Juriu.findOne({ where: { student_id, livrabil_id } });
        
        if (!membru) return res.status(403).json({ error: "Nu ești autorizat în juriu!" });

        const nota = await Nota.create({ jury_id: membru.jury_id, valoare });
        res.status(201).json(nota);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CALCUL REZULTATE (Media fără extreme) ---
app.get("/results/:livrabil_id", async (req, res) => {
    try {
        const note = await Nota.findAll({
            include: [{ model: Juriu, where: { livrabil_id: req.params.livrabil_id } }]
        });

        if (note.length < 3) return res.json({ message: "Minim 3 note necesare.", media_finala: "N/A" });

        let v = note.map(n => parseFloat(n.valoare)).sort((a, b) => a - b);
        let filtrate = v.slice(1, -1); // Eliminăm prima și ultima notă
        let media = (filtrate.reduce((a, b) => a + b, 0) / filtrate.length).toFixed(2);

        res.json({ media_finala: media, note_eliminate: [v[0], v[v.length-1]] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// RUTA SEED 
app.get("/seed", async (req, res) => {
    try {
        await sequelize.sync({ force: true });
        const s1 = await Profil.create({ nume_utilizator: "Ion", email: "ion@test.ro", parola: "123", tip: "evaluator" });
        const s2 = await Profil.create({ nume_utilizator: "Ana", email: "ana@test.ro", parola: "123", tip: "evaluator" });
        const s3 = await Profil.create({ nume_utilizator: "Dan", email: "dan@test.ro", parola: "123", tip: "evaluator" });
        
        const p = await Proiect.create({ titlu: "Proiect Test Web", descriere: "Demo Spark", creator_id: s1.profil_id });
        const l = await Livrabil.create({ proiect_id: p.proiect_id, titlu: "Video Prezentare", video_link: "http://demo.com" });
        
       
        await Juriu.create({ livrabil_id: l.livrabil_id, student_id: s2.profil_id });
        await Juriu.create({ livrabil_id: l.livrabil_id, student_id: s3.profil_id });
        
        res.send("Baza de date resetată și populată! Folosește ID 2 sau 3 în React.");
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 5001;
// PORNIRE SERVER PE PORTUL 5001
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log("BACKEND RUNNING ON PORT " + PORT);
    console.log("Test URL: http://localhost:" + PORT + "/seed");
    console.log("-----------------------------------------");
  });
});