const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Juriu = require("./Juriu");

const Nota = sequelize.define("nota", {
    nota_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valoare: {
        type: Sequelize.DECIMAL(4, 2), 
        allowNull: false,
        validate: { min: 1, max: 10 } 
    }
});

Nota.belongsTo(Juriu, { foreignKey: "jury_id" });

module.exports = Nota;