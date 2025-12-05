const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Profil = sequelize.define("profil", {
    profil_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nume_utilizator: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    parola: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tip: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Profil;
