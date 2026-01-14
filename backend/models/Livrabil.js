const Sequelize = require("sequelize");
const sequelize = require("../sequelize");
const Proiect = require("./Proiect");

const Livrabil = sequelize.define("livrabil", {
    livrabil_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titlu: {
        type: Sequelize.STRING,
        allowNull: false
    },
    video_link: {
        type: Sequelize.STRING
    },
    server_link: {
        type: Sequelize.STRING
    },
    data_livrabil: {
        type: Sequelize.DataTypes.DATE
    }
});

Proiect.hasMany(Livrabil, { foreignKey: "proiect_id" });
Livrabil.belongsTo(Proiect, { foreignKey: "proiect_id" });

module.exports = Livrabil;
