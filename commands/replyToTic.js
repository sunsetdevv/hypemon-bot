const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('../config.json');
const client3 = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });

client3.login(token);

module.exports = {
    name: ['reply', 'replyTic', 'replyToTic', 'repTic', 'reptic', 'rep'],
    async execute(message, args) {
        if (message.author.id != '755928359187382412') return;

        const filter = m => m.author.id === message.author.id;

        let text;
        const ticNum = args[0];
        const replyId = args[1];
        const replyDate = args[2];

        if (!args[0] || !args[1] || !args[2]) {
            message.channel.send('You forgot the args dummy (TicNum, ReplyId, ReplyDate)');
            return;
        }

        const replyUser = await client3.users.fetch(replyId, false);
        const paraPfp = await client3.users.fetch('755928359187382412');

        message.channel.send('Type in your response to the ticket');

        const collector = message.channel.createMessageCollector({ filter, time: 30000 })
        collector.on('collect', async collected => {
            text = collected.content;
            collector.stop();
        });

        collector.on('end', collected => {
            let replyEmbed = new EmbedBuilder()
                .setColor('BLUE')
                .setTitle('Ticket Received!')
                .setDescription('Parallax has received the ticket you submitted, and thanks you for helping with development. This is his response:\n\n`' + text + '`')
                .setFooter({ text: `Ticket number: ${ticNum} | Ticket received: ${replyDate}`, iconURL: replyUser.displayAvatarURL() })
                .setThumbnail(paraPfp.avatarURL())

            replyUser.send({ embeds: [replyEmbed] }).then(() => {
                setTimeout(() => {
                    client3.destroy();
                }, 5000);
            });
        });
    }
}