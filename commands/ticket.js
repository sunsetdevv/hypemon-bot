const { Client, GatewayIntentBits, ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');
const { ticNumber } = require('../database/database.js');
const { token } = require('../config.json');
const client2 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });

client2.login(token);

module.exports = {
    name: ['ticket', 'tic'],
    async execute(message, args) {
        const user = message.author;
        const filter = i => i.user.id == user.id;
        const filter2 = m => m.author.id != '1024787285390151792';
        const eee = ticNumber.create({
            tru: true,
            number: 1
        });
        const ticketInstance = await ticNumber.findOne({ where: { tru: true } });
        const ticNum = ticketInstance.get('number');
        let reason, text;

        const startTicEmbed = new EmbedBuilder()
            .setTitle('HypeMon Ticket System')
            .setDescription('Welcome to the HypeMon ticket system. This is intended to help with development and make your experience as enjoyable as possible by finding bugs and making suggestions for the bot. To submit a ticket, please press the "Submit" button.')
            .setColor('000000')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()

        const firstTicEmbed = new EmbedBuilder()
            .setTitle('Ticket Submission')
            .setDescription('Please select your reason for submitting a ticket below.')
            .setColor('000000')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()

        const secondTicEmbed = new EmbedBuilder()
            .setTitle('Ticket Submission')
            .setDescription('Type your message that you would like to be submitted below to submit the ticket.')
            .setColor('FFFFFF')
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()

        const reasonSelect = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('reason')
                .setPlaceholder('Select a reason for your ticket')
                .addOptions([
                    {
                        label: 'Suggestion/Feedback',
                        value: 'suggest'
                    },
                    {
                        label: 'Bug report',
                        value: 'bug'
                    },
                    {
                        label: 'Question',
                        value: 'ques'
                    },
                    {
                        label: 'Other',
                        value: 'other'
                    }
                ]),
        )


        message.channel.send({ embeds: [firstTicEmbed], components: [reasonSelect] });

        const collector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu, idle: 15000 });

        collector.on('collect', async collected => {
            const value = collected.values[0];

            if (value == 'suggest') {
                collected.update({ embeds: [secondTicEmbed], components: [] });
                reason = "Suggestion/Feedback";
            }
            if (value == 'bug') {
                collected.update({ embeds: [secondTicEmbed], components: [] });
                reason = "Bug report";
            }
            if (value == 'ques') {
                collected.update({ embeds: [secondTicEmbed], components: [] });
                reason = "Question";
            }
            if (value == 'other') {
                collected.update({ embeds: [secondTicEmbed], components: [] });
                reason = "Other";
            }
        });

        const collector2 = message.channel.createMessageCollector({ filter: filter2, time: 30000 })
        collector2.on('collect', async collected2 => {
            text = collected2.content;
            collector2.stop();
        })

        collector2.on('end', async collected2 => {
            const finalTicEmbed = new EmbedBuilder()
                .setTitle('Ticket Submitted')
                .setAuthor({ name: `Ticket number: ${ticNum}` })
                .setDescription('Thank you for your submission. It has been DM\'d to Parallax to be evaluated.\n\n`Content:` ' + text)
                .setColor('49BE25')
                .setFooter({ text: `Ticket requested by: ${user.username}` })
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp()

            const ticketEmbed = new EmbedBuilder()
                .setTitle('New Ticket Submitted')
                .setColor('000000')
                .setThumbnail('https://cdn.discordapp.com/attachments/983502820248551504/1025976378308427796/pvoasdva.png')
                .setAuthor({ name: `Ticket number ${ticNum}` })
                .setFooter({ text: `Submitted by ${user.username} | ID: ${user.id}`, iconURL: user.displayAvatarURL() })
                .setDescription(`Reason: \`${reason}\` \n\n` + `Content: \`${text}\`\n`)

            message.channel.send({ embeds: [finalTicEmbed] });

            await client2.users.fetch('755928359187382412', false).then(user => {
                user.send({ embeds: [ticketEmbed] });
            }).then(() => {
                setTimeout(() => {
                    client2.destroy();
                }, 5000);
            });
        });

        ticketInstance.increment('number');   
    }
}