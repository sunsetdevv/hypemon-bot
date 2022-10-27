const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { Players } = require('../database/database.js');

module.exports = {
    name: ['inventory', 'inv', 'items'],
    async execute(message, args) {
        const userDb = await Players.findOne({ where: { USER_ID: message.author.id } });

        if (!userDb) return message.reply('You have not selected a HypeMon type yet. Please use `hm typeselect` to do so.');

        const filter = i => i.user.id === message.author.id;

        const invEmbedItems = new EmbedBuilder()
            .setTitle(`${message.author.username}'s Inventory`)
            //.setDescription()
            .setColor('7F7F7F')
            .setFooter({ text: `${message.author.username}'s items`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' }
            );

        const invEmbedMoves = new EmbedBuilder()
            .setTitle(`${message.author.username}'s Inventory`)
            //.setDescription()
            .setColor('7F7F7F')
            .setFooter({ text: `${message.author.username}'s moves`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
            .addFields(
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' },
                { name: 'Under', value: 'Development' }
            );

        const row1 = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('types')
                .setPlaceholder('Select a type to start your HypeMon adventure!')
                .addOptions([
                    {
                        label: 'Items',
                        description: 'All of your items',
                        value: 'items'
                    },
                    {
                        label: 'Moves',
                        description: 'All of your moves',
                        value: 'moves'
                    }
                ]),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        );


        message.channel.send({ embeds: [invEmbedItems], components: [row1, row2] });


        const butCollector = message.channel.createMessageComponentCollector();

        const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu, idle: 15000 })
        collector.on('collect', async collected => {
            const value = collected.values[0];

            if (value === 'items') {
                collected.update({ embeds: [invEmbedItems], components: [row1, row2] });
            }
            if (value === 'moves') {
                collected.update({ embeds: [invEmbedMoves], components: [row1, row2] });
            }
        });

        butCollector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                i.reply({ content: `This isn't for you.`, ephemeral: true });
                return;
            } else {
                if (i.customId === 'end_int') {
                    await i.deferUpdate();
                    await i.editReply({ components: [] });
                    collector.stop();
                    butCollector.stop();
                }
            }
        });
    }
}