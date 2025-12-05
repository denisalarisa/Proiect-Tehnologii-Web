const express = require("express");
const sequelize = require("./sequelize");

const Profil = require("./models/Profil");
const Proiect = require("./models/Proiect");
const Livrabil = require("./models/Livrabil");

const app = express();
app.use(express.json());

app.post("/register", function (req, res) {
    Profil.create(req.body)
        .then(function (profil) {
            res.status(201).json(profil);
        })
        .catch(function (error) {
            res.status(500).json({ error: error.message });
        });
});

app.post("/projects", function (req, res) {
    Proiect.create(req.body)
        .then(function (proiect) {
            res.status(201).json(proiect);
        })
        .catch(function (error) {
            res.status(500).json({ error: error.message });
        });
});

app.post("/deliverables", function (req, res) {
    Livrabil.create(req.body)
        .then(function (liv) {
            res.status(201).json(liv);
        })
        .catch(function (error) {
            res.status(500).json({ error: error.message });
        });
});

app.get("/projects", function (req, res) {
    Proiect.findAll({
        include: Profil
    })
    .then(function (proiecte) {
        res.json(proiecte);
    })
    .catch(function (error) {
        res.status(500).json({ error: error.message });
    });
});

sequelize.sync()
    .then(function () {
        console.log("DB synced successfully");

        app.listen(3000, function () {
            console.log("Server running on http://localhost:3000");
        });
    })
    .catch(function (error) {
        console.log("Error syncing DB:", error);
    });
