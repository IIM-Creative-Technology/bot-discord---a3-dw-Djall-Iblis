const Discord = require('discord.js');
const mysql = require('mysql');

require('../bot')

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

            const currentNeededXp = 4 + currentLevel;

            const missingXp = currentNeededXp - currentXp
            let singleOrNot = '';

            if (missingXp === 1) {
                singleOrNot = 'point d\'experience'
            } else {
                singleOrNot = 'points d\'experiences'
            }

            message.channel.send(`Vous êtes niveau : ${currentLevel} et il vous reste ${missingXp + ' ' + singleOrNot} pour passer niveau : ${currentLevel + 1} !`)

        });

    }

};

module.exports.name = 'myLvl';
