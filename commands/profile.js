const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, Embed, ButtonStyle, ComponentType, MessageComponentInteraction } = require('discord.js');
const { Players } = require('../database/database.js');

module.exports = {
    name: ['profile', 'info', 'pf', 'userinfo'],
    async execute(message, args) {
        let user, errMsg;
        if (message.mentions.users.first()) {
            user = message.mentions.users.first();
            errMsg = 'The person you have mentioned has not selected a type for their HypeMon yet.';
        } else {
            user = message.author;
            errMsg = 'You have not selected a type for your HypeMon yet. Please use `hm typeselect` before running any other commands.';
        }

        const userInDb = await Players.findOne({ where: { USER_ID: user.id } });

        if (userInDb) {
            const level = userInDb.get('LVL');
            const exp = userInDb.get('EXP');
            const geo = userInDb.get('GEO');
            const move1 = userInDb.get('MOVE_ONE');
            const move2 = userInDb.get('MOVE_TWO');
            const move3 = userInDb.get('MOVE_THREE');
            const hmType = userInDb.get('TYPE');
            const btlsWon = userInDb.get('BTLS_WON');
            const favMove = userInDb.get('FAV_MOVE');
            const statPts = userInDb.get('STAT_PTS');
            
            const profEmbed = new EmbedBuilder()
                .setTitle(`${user.username}'s Profile | Type: ` + hmType.toString())
                //.setDescription('')
                .setColor('BLACK')
                //.setFooter({ text: 'For more stats, use the drop-down menu below' })
                .setThumbnail(user.avatarURL())
                .addFields(
                    { name: 'Level', value: '`' + level.toString() + '`', inline: true },
                    { name: 'Experience', value: '`' + exp.toString() + '`', inline: true },
                    { name: 'Geo', value: '`' + geo.toString() + '`', inline: true },
                    { name: 'Move 1', value: '`' + move1.name + '`', inline: true },
                    { name: 'Move 2', value: '`' + move2.name + '`', inline: true },
                    { name: 'Move 3', value: '`' + move3.name + '`', inline: true },
                    { name: 'Stat points:', value: '`' + statPts + '`', inline: true },
                    { name: 'Battles won:', value: '`' + btlsWon + '`', inline: true },
                    { name: 'Favorite move:', value: '`' + favMove + '`', inline: true }
                    
                )

            message.channel.send({ embeds: [profEmbed] });

        } else {
            message.reply(errMsg);
        }
    }
}