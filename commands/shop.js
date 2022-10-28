const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, ButtonStyle, ComponentType, InteractionCollector } = require('discord.js');
const { Players } = require('../database/database.js');

module.exports = {
    name: ['shop'],
    async execute(message, args) {
        const user = message.author;
        const userDb = await Players.findOne({ where: { USER_ID: user.id } });
        let page = 1;

        const pageOne = new EmbedBuilder()
            .setAuthor({ name: 'HypeMon Shop' })
            .setTitle('Featured Items')
            .setColor('DarkButNotBlack')
            .setThumbnail('https://cdn.discordapp.com/attachments/1010304877668352060/1035400969460138024/unknown.png')
            .addFields(
                { name: 'Item here', value: 'Description here' },
                { name: 'Item here', value: 'Description here' },
                { name: 'Item here', value: 'Description here' },
                { name: 'Item here', value: 'Description here' },
                { name: 'Item here', value: 'Description here' }
            )

        const pageTwo = new EmbedBuilder()
            .setAuthor({ name: 'HypeMon Shop' })
            .setTitle('Stat Boosting Items')
            .setColor('DarkButNotBlack')
            .setThumbnail('https://cdn.discordapp.com/attachments/1010304877668352060/1035400969460138024/unknown.png')
            .addFields(
                { name: 'Unbreakable Strength - <:Geo:1035579816587563099>', value: 'Boosts attack by 5' },
                { name: 'Steady Body - <:Geo:1035579816587563099>', value: 'Boosts defense by 5' },
                { name: 'Dashmaster - <:Geo:1035579816587563099>', value: 'Boosts speed by 5' }
            )

        const pageThree = new EmbedBuilder()
            .setAuthor({ name: 'HypeMon Shop' })
            .setTitle('Healing Items')
            .setColor('DarkButNotBlack')
            .setThumbnail('https://cdn.discordapp.com/attachments/1010304877668352060/1035405080201007135/unknown.png')
            .addFields(
                { name: 'Quick Focus - <:Geo:1035579816587563099>', value: 'Heals 5 health points' },
                { name: 'Focus - <:Geo:1035579816587563099>', value: 'Heals 20 health points' },
                { name: 'Deep Focus - <:Geo:1035579816587563099>', value: 'Heals 50 health points' },
                { name: 'Kingsoul - <:Geo:1035579816587563099>', value: 'Heals 10 health points every 4 turns' }
            )

        const pageFour = new EmbedBuilder()
            .setAuthor({ name: 'HypeMon Shop' })
            .setTitle('Effect Removing Items')
            .setColor('DarkButNotBlack')
            .setThumbnail('https://cdn.discordapp.com/attachments/1010304877668352060/1035406987346841640/unknown.png')
            .addFields(
                { name: 'Joni\'s Blessing - <:Geo:1035579816587563099>', value: 'Cures your HypeMon from poisoning' },
                { name: 'Shape of Unn - <:Geo:1035579816587563099>', value: 'Removes the paralysis effect from your HypeMon' },
                { name: 'Grubsong - <:Geo:1035579816587563099>', value: 'Takes your HypeMon out of confusion' },
                { name: 'Dream Wielder - <:Geo:1035579816587563099>', value: 'Wakes your HypeMon up from sleep' }
            )

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Previous')
                    .setCustomId('back')
                    .setDisabled(true),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel('Next')
                    .setCustomId('forward'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('End interaction')
                    .setCustomId('end_int')
            )

        message.channel.send({ embeds: [pageOne], components: [row] }).then(msg => {
            butCollector.on('end', async (collected, reason) => {
                if (reason == 'idle') {
                    row.components[0].setDisabled(true);
                    row.components[1].setDisabled(true);
                    row.components[2].setDisabled(true);

                    msg.edit({ components: [row] });
                }
            });
        });

        const butCollector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button, idle: 20000 });

        butCollector.on('collect', async i => {
            if (i.user.id != user.id) {
                i.reply({ content: `This isn't for you.`, ephemeral: true })
                return;
            } else {
                await i.deferUpdate();
                if (i.customId == 'back') {
                    if (page == 2) {
                        row.components[0].setDisabled(true);
                        await i.editReply({ embeds: [pageOne], components: [row] });
                        page = 1;
                    } else if (page == 3) {
                        await i.editReply({ embeds: [pageTwo], components: [row] });
                        page = 2;
                    } else if (page == 4) {
                        row.components[1].setDisabled(false);
                        await i.editReply({ embeds: [pageThree], components: [row] });
                        page = 3;
                    }
                } else if (i.customId == 'forward') {
                    if (page == 1) {
                        row.components[0].setDisabled(false);
                        await i.editReply({ embeds: [pageTwo], components: [row] });
                        page = 2;
                    } else if (page == 2) {
                        await i.editReply({ embeds: [pageThree], components: [row] });
                        page = 3;
                    } else if (page == 3) {
                        row.components[1].setDisabled(true);
                        await i.editReply({ embeds: [pageFour], components: [row] });
                        page = 4;
                    }
                } else if (i.customId == 'end_int') {
                    await i.editReply({ components: [] });
                }
            }
        });

    }
}
