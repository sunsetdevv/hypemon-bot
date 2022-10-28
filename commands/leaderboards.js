const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType, SelectMenuBuilder } = require('discord.js');
const { Players } = require('../database/database.js');

module.exports = {
    name: ['leaderboard', 'leaderboards', 'lb'],
    async execute(message, args) {
        //leaderboards: battles won, moves used, exp, level, total earned geo, total current geo, win streak

        const userDb = await Players.findOne({ where: { USER_ID: message.author.id } });
        if (!userDb) return message.reply('You must join HypeMon to use this command! Try using `hm ts` first.');

        const filter = i => i.user.id === message.author.id;

        const battles_db = await Players.findAll({ attributes: ['USERNAME', 'BTLS_WON'], order: [['BTLS_WON', 'DESC']] });
        const levels_db = await Players.findAll({ attributes: ['USERNAME', 'LVL'], order: [['LVL', 'DESC']] });
        const exps_db = await Players.findAll({ attributes: ['USERNAME', 'EXP'], order: [['EXP', 'DESC']] });
        const totalgeos_db = await Players.findAll({ attributes: ['USERNAME', 'TOTAL_GEO'], order: [['TOTAL_GEO', 'DESC']] });
        const winstreaks_db = await Players.findAll({ attributes: ['USERNAME', 'WINSTREAK'], order: [['WINSTREAK', 'DESC']] });
        const movess_db = await Players.findAll({ attributes: ['USERNAME', 'MOVES_USED'], order: [['MOVES_USED', 'DESC']] });

        const battles = battles_db.map(t => `**${t.USERNAME}:** ${t.BTLS_WON}`).join('\n');
        const levels = levels_db.map(t => `**${t.USERNAME}:** ${t.LVL}`).join('\n');
        const exps = exps_db.map(t => `**${t.USERNAME}:** ${t.EXP}`).join('\n');
        const totalgeos = totalgeos_db.map(t => `**${t.USERNAME}:** ${t.TOTAL_GEO}`).join('\n');
        const winstreaks = winstreaks_db.map(t => `**${t.USERNAME}:** ${t.WINSTREAK}`).join('\n');
        const movess = movess_db.map(t => `**${t.USERNAME}:** ${t.MOVES_USED}`).join('\n');

        const mainEmbed = new EmbedBuilder()
            .setTitle('HypeMon Leaderboards')
            .setColor('Grey')
            .setThumbnail('https://cdn.discordapp.com/attachments/983502820248551504/1026986084850204743/lbtrophy.png')
            .setFooter({ text: "Thank you for using the HypeMon bot! ", iconURL: 'https://cdn.discordapp.com/attachments/983502820248551504/1025976378308427796/pvoasdva.png' })
            .setDescription("**Welcome to the HypeMon Leaderboards!**\nHere you can view all your friends' HypeMon stats, and see where you place on the leaderboards!\n\nYou can view all of the boards using the drop-down menu attached to this embed. If you have any suggestions for a leaderboard topic, feel free to either DM Para or use the ticket system.")
            .setTimestamp()

        const btlswonEmbed = new EmbedBuilder()
            .setTitle("Battles Won")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(battles)

        const movesusedEmbed = new EmbedBuilder()
            .setTitle("Moves Used")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(movess)

        const expEmbed = new EmbedBuilder()
            .setTitle("Total EXP")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(exps)

        const levelEmbed = new EmbedBuilder()
            .setTitle("Highest Level")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(levels)

        const geoEmbed = new EmbedBuilder()
            .setTitle("Total Geo Earned")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(totalgeos)

        const winstreakEmbed = new EmbedBuilder()
            .setTitle("Longest Winstreak")
            .setAuthor({ name: "HypeMon Leaderboards" })
            .setDescription(winstreaks)

        const mainRow = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('boards')
                .setPlaceholder('Select which leaderboard you would like to view')
                .addOptions(
                    {
                        label: 'Battles Won',
                        value: 'btls'
                    },
                    {
                        label: 'Level',
                        value: 'lvl'
                    },
                    {
                        label: 'Total EXP',
                        value: 'exp'
                    },
                    {
                        label: 'Total Geo',
                        value: 'geo'
                    },
                    {
                        label: 'Longest Winstreak',
                        value: 'winstrk'
                    },
                    {
                        label: 'Moves Used',
                        value: 'moves'
                    },
                    {
                        label: 'Main Page',
                        description: 'Back to the starting page',
                        value: 'main'
                    }
                )
        )

        const butRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        )

        message.channel.send({ embeds: [mainEmbed], components: [mainRow, butRow] }).then(msg => {
            menuCollector.on('end', async (collected, reason) => {
                if (reason == 'idle') {
                    mainRow.components[0].setDisabled(true);
                    butRow.components[0].setDisabled(true);
                    msg.edit({ components: [mainRow, butRow] });
                }
            });
        });


        const butCollector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button });
        const menuCollector = message.channel.createMessageComponentCollector({ filter: filter, componentType: ComponentType.SelectMenu, idle: 15000 });

        menuCollector.on('collect', async collected => {
            const value = collected.values[0];

            if (value === 'btls') {
                collected.update({ embeds: [btlswonEmbed], components: [mainRow, butRow] });
            } else if (value === 'lvl') {
                collected.update({ embeds: [levelEmbed], components: [mainRow, butRow] });
            } else if (value === 'exp') {
                collected.update({ embeds: [expEmbed], components: [mainRow, butRow] });
            } else if (value === 'geo') {
                collected.update({ embeds: [geoEmbed], components: [mainRow, butRow] });
            } else if (value === 'winstrk') {
                collected.update({ embeds: [winstreakEmbed], components: [mainRow, butRow] });
            } else if (value === 'moves') {
                collected.update({ embeds: [movesusedEmbed], components: [mainRow, butRow] });
            } else if (value === 'main') {
                collected.update({ embeds: [mainEmbed], components: [mainRow, butRow] });
            }
        });

        butCollector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                await i.reply({ content: `Nope`, ephemeral: true })
                return;
            } else {
                if (i.customId === 'end_int') {
                    i.update({ components: [] });
                    menuCollector.stop();
                    butCollector.stop();
                }
            }
        });

    }
}
