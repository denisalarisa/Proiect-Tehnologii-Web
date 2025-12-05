const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Profil = require("./Profil");

const Proiect = sequelize.define("proiect", {
    proiect_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titlu: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descriere: {
        type: Sequelize.STRING
    }
});

Profil.hasMany(Proiect, { foreignKey: "creator_id" });
Proiect.belongsTo(Profil, { foreignKey: "creator_id" });

module.exports = Proiect;
