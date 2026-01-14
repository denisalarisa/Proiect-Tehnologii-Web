const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Profil = require("./Profil");
const Livrabil = require("./Livrabil");

const Juriu = sequelize.define("juriu", {
    jury_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});


Juriu.belongsTo(Profil, { foreignKey: "student_id" }); // Cine e juratul
Juriu.belongsTo(Livrabil, { foreignKey: "livrabil_id" }); // Ce livrabil notează

module.exports = Juriu;