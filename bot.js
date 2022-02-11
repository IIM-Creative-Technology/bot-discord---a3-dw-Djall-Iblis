const clientLoader = require('./src/clientLoader');
const commandLoader = require('./src/commandLoader');

const mysql = require('mysql');
const Discord = require('discord.js');
require('dotenv').config();

require('colors');

const COMMAND_PREFIX = '!';

clientLoader.createClient(['GUILD_MESSAGES', 'GUILDS', 'GUILD_MEMBERS'])
    .then(async (client) => {
        await commandLoader.load(client);

        // Connection à la base de données
        const con = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        await con.connect((err) => {
            if (err) {
                console.log('Il y a un problème', err);
            } else {
                console.log('Connection réussi');
            }
        });


        // le système pour que le bot reconnaisse les commands
        client.on('messageCreate', async (message) => {
            // Ne pas tenir compte des messages envoyés par les bots, ou qui ne commencent pas par le préfix
            if (message.author.bot || !message.content.startsWith(COMMAND_PREFIX)) return;

            // On découpe le message pour récupérer tous les mots
            const words = message.content.split(' ');

            const commandName = words[0].slice(1); // Le premier mot du message, auquel on retire le préfix
            const arguments = words.slice(1); // Tous les mots suivants sauf le premier

            if (client.commands.has(commandName)) {
                // La commande existe, on la lance
                client.commands.get(commandName).run(client, message, arguments);
            } else {
                // La commande n'existe pas, on prévient l'utilisateur
                await message.delete();
                await message.channel.send(`The ${commandName} does not exist.`);
            }
        })

        // Ajoute un rôle quand un nouveau membre rejoind le serveur
        client.on('guildMemberAdd', async (member) => {
            await member.roles.add('941687339921588286');

            // Et l'ajoute a la base de données pour l'XP
            const user = member.id

            await con.query("SELECT xp.user_id FROM xp", function (err, result) {
                if (err) throw err;

                let dontAdd = false

                result.map(item => {
                    if (item.user_id === user) {
                        dontAdd = true;
                    }
                })

                if (dontAdd === false) {
                    const addUser = `INSERT INTO xp (user_id) VALUE('${user}')`

                    con.query(addUser);
                }
            });

            await con.query("SELECT user_behavior.user_id FROM user_behavior", function (err, result) {
                if (err) throw err;

                let dontAdd = false

                result.map(item => {
                    if (item.user_id === user) {
                        dontAdd = true;
                    }
                })

                if (dontAdd === false) {
                    const addUser = `INSERT INTO user_behavior (user_id) VALUE('${user}')`

                    con.query(addUser);
                }
            });
        });


        client.on("messageCreate", async (message) => {

            // on check si c'est pas un bot qui envoi le message
            if (!message.author.bot) {


                // on recupere des informations importantes pour la suite
                const user = message.author.id
                const username = message.author.username
                const colorRole = message.member.displayHexColor
                const thisServer = message.guild.name

                // prépare les message Embed vu qu'on va les utilisés
                const embed = new Discord.MessageEmbed();

                // on recupere les données, de l'user, de la base de données
                await con.query(`SELECT xp.id as 'xp_id', 
                                        xp.user_id as 'xp_user_id', 
                                        xp.xp_count as 'xp_count', 
                                        xp.xp_level as 'xp_level' 
                                FROM xp 
                                WHERE user_id='${user}'`,
                    function (err, result) {
                    if (err) throw err;


// ----------------------Systeme d'experience -------------------------------------------------------------------------------------------------------------

                    // Si le membre était la avant le bot il n'est pas dans la base de données
                    // donc si c'est le cas tu l'ajoute a cette base
                    if (result.length === 0) {
                        const addUser = `INSERT INTO xp (user_id) VALUE('${user}')`

                        con.query(addUser);
                    }
                        const currentXp = parseInt(result[0].xp_count);
                        const currentLevel = parseInt(result[0].xp_level);
                        const currentNeededXp = 4 + currentLevel;

                    // Ensuite on lui donne de l'xp quand il met un message

                    if (result.length > 0) {
                        // Si on a trouvé le user en base de donnée

                        const addXp = `UPDATE xp
                                       SET xp_count=${currentXp + 1}
                                       WHERE user_id='${user}'`;

                        con.query(addXp, (err, result) => {
                            if (err) throw err;
                        });

                        console.log('xp =' + currentXp)
                        console.log('lvl =' + currentLevel)


                        // Si il atteint le cap d'xp il monte un niveau et réinitialise son xp
                        if (currentXp === currentNeededXp) {
                            const reinitXp = `UPDATE xp
                                              SET xp_count=0
                                              WHERE user_id='${user}'`;

                            const levelUp = `UPDATE xp
                                             SET xp_level=${currentLevel + 1}
                                             WHERE user_id='${user}'`;

                            con.query(reinitXp, (err, result) => {
                                if (err) throw err;
                            });

                            con.query(levelUp, (err, result) => {
                                if (err) throw err;
                            });
                        }

                        // Quand il atteint certain niveau on lui accorde un rôle particulier
                        let member = message.member;
                        let novice = message.guild.roles.cache.find(r => r.id === "941687339921588286");
                        let apprenti = message.guild.roles.cache.find(r => r.id === "941687849982513152");
                        let soldat = message.guild.roles.cache.find(r => r.id === "941688108267745340");
                        let chevalier = message.guild.roles.cache.find(r => r.id === "941688266489483288");
                        let maitre = message.guild.roles.cache.find(r => r.id === "941688367983247382");

                        // Novice => Apprenti
                        if (currentLevel === 2) {
                            member.roles.add(apprenti);

                            member.roles.remove(novice)
                        }
                        // Apprenti => Soldat
                        else if (currentLevel === 10) {
                            member.roles.add(soldat);

                            member.roles.remove(apprenti)
                        }
                        // Soldat => Chevalier
                        else if (currentLevel === 50) {
                            member.roles.add(chevalier);

                            member.roles.remove(soldat)
                        }
                        // Chevalier => Maître
                        else if (currentLevel === 100) {
                            member.roles.add(maitre);

                            member.roles.remove(chevalier)
                        }
                    }


//---------------------------Systeme multi-serveur--------------------------------------------------------------------

                    // juste pour gérer le pluriel des points d'xp
                    let singleOrNot;
                    if (currentXp === 1) {
                        singleOrNot = 'point d\'experience'
                    } else {
                        singleOrNot = 'points d\'experiences'
                    }

                    // on prépare le message Embed
                    embed
                        .setTitle(username)
                        .setDescription(`a envoyé un message depuis ${thisServer}, il est niveau ${currentLevel} avec ${currentXp + ' ' + singleOrNot}`)
                        .setColor(colorRole)

                    // on l'envoi sur tou les channels Shared des différents serveurs
                    try {
                        client.guilds.cache.forEach((guild => {
                            guild.channels.cache.find(channel => channel.name === 'shared').send({ embeds: [ embed ] });
                        }))
                    } catch (err) {
                        console.log("Could not send message to " + guild.name);
                    }
                });

//---------------------------Systeme anti-insulte--------------------------------------------------------------------

                const listBadWord = [
                    'connard',
                    'con',
                    'connasse',
                ]

                const message_words = message.content.split(' ');

                // on recupere les données, de l'user, de la base de données
                await con.query(`SELECT user_behavior.id as 'id',
                                         user_behavior.user_id as 'user_id',
                                         user_behavior.warning as 'warning'
                                FROM user_behavior
                                WHERE user_id='${user}'`,
                    function (err, result) {
                        if (err) throw err;

                        if (result.length === 0) {
                            const addUser = `INSERT INTO user_behavior (user_id) VALUE('${user}')`

                            con.query(addUser);
                        }

                        if (result.length > 0) {
                            const currentWarning = parseInt(result[0].warning);

                            message_words.forEach(word => {
                                listBadWord.forEach(badword => {
                                    if (badword === word) {
                                        message.delete()

                                        const addWarning = `UPDATE user_behavior
                                                            SET warning=${currentWarning + 1}
                                                            WHERE user_id='${user}'`;

                                        con.query(addWarning);

                                        if (currentWarning === 0) {
                                            message.author.send("Tu n'as pas le droit d'utilisé ce genre de mot, tu prends donc un avertissement. Au bout de 3 avertissements tu seras expulsé !!")
                                        } else if (currentWarning === 1) {
                                            message.author.send("Tu n'as pas le droit d'utilisé ce genre de mot, tu prends donc un avertissement. Tu en as déjà reçu 1, encore 2 et tu seras explusé !! !!")
                                        } else if (currentWarning === 2) {
                                            message.author.send("Tu n'as pas le droit d'utilisé ce genre de mot, tu prends donc un avertissement. Tu es a 2 avertissements, plus qu'un et tu seras expulsé !!")
                                        } else if (currentWarning === 3) {
                                            message.author.send("Je suis désolé mais les avertissement sont terminé, au revoir !!")

                                            message.member.ban()
                                        }

                                    }
                                })
                            })
                        }
                });
            }
        })
    });
