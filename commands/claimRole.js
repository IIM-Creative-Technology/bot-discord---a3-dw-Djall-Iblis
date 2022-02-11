const Discord = require('discord.js');
const mysql = require("mysql");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {

    if (!message.author.bot) {

        const user = message.author.id

        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        await con.query(`SELECT xp.id as 'xp_id', xp.user_id as 'xp_user_id', xp.xp_count as 'xp_count', xp.xp_level as 'xp_level' FROM xp WHERE user_id='${user}'`, function (err, result) {
            if (err) throw err;

            const currentXp = parseInt(result[0].xp_count);
            const currentLevel = parseInt(result[0].xp_level);
            // const currentRole = message.member.roles.cache.find(role => role.id === )

            let currentRoleId;

            // on verifie le role actuel du membre
            message.member.roles.cache.forEach(role => {
                if (role.name === 'Novice') {
                    currentRoleId = role.id
                } else if (role.name === 'Apprenti') {
                    currentRoleId = role.id
                } else if (role.name === 'Soldat') {
                    currentRoleId = role.id
                } else if (role.name === 'Chevalier') {
                    currentRoleId = role.id
                } else if (role.name === 'Maitre') {
                    currentRoleId = role.id
                }
            })
            console.log('tu es :     ' + currentRoleId)


            let deservedRole;
            let novice = message.guild.roles.cache.find(role => role.id === "941687339921588286");
            let apprenti = message.guild.roles.cache.find(role => role.id === "941687849982513152");
            let soldat = message.guild.roles.cache.find(role => role.id === "941688108267745340");
            let chevalier = message.guild.roles.cache.find(role => role.id === "941688266489483288");
            let maitre = message.guild.roles.cache.find(role => role.id === "941688367983247382");

            // on determine quel role lui reviens suivant son level
            if (currentLevel >= 0 && currentLevel < 2) {
                deservedRole = novice
            } else if (currentLevel >= 2 && currentLevel < 10) {
                deservedRole = apprenti
            } else if (currentLevel >= 10 && currentLevel < 50) {
                deservedRole = soldat
            } else if (currentLevel >= 50 && currentLevel < 100) {
                deservedRole = chevalier
            } else if (currentLevel >= 100) {
                deservedRole = maitre
            }
            console.log('tu merites : ' + deservedRole)

            // on vérifie que le membre n'a pas déjà ce role
            if (currentRoleId !== deservedRole.id) {
                message.member.roles.add(deservedRole);
                message.channel.send(`Vous êtes maintenant ${deservedRole} !`)

            } else {
                message.channel.send(`Vous êtes déjà ${deservedRole} !`)
            }

        });

    }
};

module.exports.name = 'claim';
