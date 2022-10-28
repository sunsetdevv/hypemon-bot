const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, Embed, ButtonStyle, ComponentType, MessageComponentInteraction } = require('discord.js');
const { Players, movesList, hmIdIterator } = require('../database/database.js');

module.exports = {
    name: ['typeselect', 'ts'],
    async execute(message, args) {
        const tsUser = message.author;
        const plyr = await Players.findOne({ where: { USER_ID: message.author.id } });
        const filter = i => i.user.id === message.author.id;
        let typ;
        const beans = await hmIdIterator.create({
            tru: true,
            count: 1
        })
        const idInstance = await hmIdIterator.findOne({ where: { tru: true } });
        let hmId = idInstance.get('count');

        if (plyr) {
            return message.reply("You have already selected a type!");
        }

        const typeEmbed = new EmbedBuilder()
            .setColor('000000')
            .setTitle('HypeMon Type List')
            .setDescription('These are all the types available to be chosen for HypeMon. For further description, please see the **Types and Type Matchups** page in `hm help`.')
            .addFields(
                { name: 'Cursed type', value: 'Status effect heavy', inline: true },
                { name: 'Pure type', value: 'Reliable, steady damage', inline: true },
                { name: 'Gay type', value: 'High risk, high reward', inline: true },
                { name: 'Foolish type', value: 'Above average speed and evasion', inline: true },
                { name: 'Creative type', value: 'Focused on defense and special moves', inline: true },
                { name: 'Savvy type', value: 'Can combo and manipulate the enemy', inline: true }
            )

        const confirmEmbed = new EmbedBuilder()
            .setColor('000FFF')
            .setTitle('Placeholder')
            .setDescription('Are you sure you would like to choose  ?')

        //dropdown menu
        const row1 = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('types')
                .setPlaceholder('Select a type to start your HypeMon adventure!')
                .addOptions(
                    {
                        label: 'Cursed type',
                        description: 'Dark humor at its finest',
                        value: 'cursed'
                    },
                    {
                        label: 'Pure type',
                        description: '*Pure vessel intensifies*',
                        value: 'pure'
                    },
                    {
                        label: 'Gay type',
                        description: 'With the power of gay I smite thee!',
                        value: 'gay'
                    },
                    {
                        label: 'Foolish type',
                        description: 'Me when beans!',
                        value: 'fool'
                    },
                    {
                        label: 'Creative type',
                        description: 'Wait, how\'d you do that?',
                        value: 'creat'
                    },
                    {
                        label: 'Savvy type',
                        description: 'I am 48 parallel dimensions ahead of you',
                        value: 'savvy'
                    }
                ),
        )

        //end interaction button
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        )

        //yes or no
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Yes, select this type!')
                .setCustomId('yes'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('No, go back!')
                .setCustomId('no')
        )

        message.channel.send({ embeds: [typeEmbed], components: [row1, row2] }).then(msg => {
            menuCollector.on('end', async (collected, reason) => {
                if (reason == 'idle') {
                    row1.components[0].setDisabled(true);
                    row2.components[0].setDisabled(true);
                    msg.edit({ components: [row1, row2] });
                }
            });
        });

        const butCollector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button });

        const menuCollector = message.channel.createMessageComponentCollector({ filter: filter, componentType: ComponentType.SelectMenu, idle: 15000 });

        menuCollector.on('collect', async collected => {
            const value = collected.values[0];

            if (value === 'creat') {
                confirmEmbed.setTitle('Creative type');
                confirmEmbed.setColor('00FF33');
                confirmEmbed.setDescription('Are you sure you would like to choose **Creative Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Creative';
            }

            if (value === 'cursed') {
                confirmEmbed.setTitle('Cursed type');
                confirmEmbed.setColor('1717E6');
                confirmEmbed.setDescription('Are you sure you would like to choose **Cursed Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Cursed';
            }

            if (value === 'gay') {
                confirmEmbed.setTitle('Gay type');
                confirmEmbed.setColor('EFFF00');
                confirmEmbed.setDescription('Are you sure you would like to choose **Gay Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Gay';
            }

            if (value === 'fool') {
                confirmEmbed.setTitle('Foolish type');
                confirmEmbed.setColor('FF0055');
                confirmEmbed.setDescription('Are you sure you would like to choose **Foolish Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Foolish';
            }

            if (value === 'pure') {
                confirmEmbed.setTitle('Pure type');
                confirmEmbed.setColor('FFFFFF');
                confirmEmbed.setDescription('Are you sure you would like to choose **Pure Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Pure';
            }

            if (value === 'savvy') {
                confirmEmbed.setTitle('Savvy type');
                confirmEmbed.setColor('8A35A9');
                confirmEmbed.setDescription('Are you sure you would like to choose **Savvy Type**?');
                collected.update({ embeds: [confirmEmbed], components: [row3] });
                typ = 'Savvy';
            }

        });

        butCollector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                await i.reply({ content: `This isn't for you.`, ephemeral: true })
                return;
            } else {
                if (i.customId === 'end_int') {
                    await i.deferUpdate();
                    await i.editReply({ components: [] });
                    menuCollector.stop();
                    butCollector.stop();
                } else if (i.customId === 'yes') {
                    const finEmbed = new EmbedBuilder()
                        .setColor('Random')
                        .setTitle('Thank you for selecting your type!')
                        .setDescription('Feel free to visit the shop or check out the HypeDex. Or, challenge somebody to a HypeBattle!')
                        .setFooter({ text: `Type selected: ${typ}` })

                    await i.deferUpdate();
                    await i.editReply({ embeds: [finEmbed], components: [] })
                    menuCollector.stop();
                    butCollector.stop();
                    //DB STUFF HERE
                    try {
                        const player = await Players.create({
                            HM_ID: hmId,
                            USER_ID: tsUser.id,
                            USERNAME: tsUser.username,
                            TYPE: typ,
                            LVL: 1,
                            EXP: 0,
                            GEO: 0,
                            MOVE_ONE: Object.values(movesList[typ])[0],
                            MOVE_TWO: movesList.none,
                            MOVE_THREE: movesList.none,
                            HP: 30,
                            ATK: 1,
                            DEF: 1,
                            SPD: 1,
                            ITEMS: [],
                            STAT_PTS: 0,
                            BTLS_WON: 0,
                            FAV_MOVE: [],
                            TOTAL_GEO: 0,
                            WINSTREAK: 0,
                            MOVES_USED: 0,
                            SELECTED: true
                        });
                        idInstance.increment('count');
                    }
                    catch (error) {
                        console.error(error);
                        return message.reply('Something went wrong with adding the player.');
                    }
                } else if (i.customId === 'no') {
                    await i.deferUpdate();
                    await i.editReply({ embeds: [typeEmbed], components: [row1, row2] });
                }
            }
        });
    }
}
