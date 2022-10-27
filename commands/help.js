const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SelectMenuBuilder, ButtonStyle, ComponentType } = require('discord.js');


module.exports = {
    name: ['help'],
    async execute(message, args) {
        const filter = i => i.user.id === message.author.id;

        const helpEmbed = new EmbedBuilder()
            .setTitle('HypeMon Help')
            .setColor('35A97B')
            .setThumbnail('https://cdn.discordapp.com/attachments/938900493676208160/938903114457702450/toppng.com-hollow-knight-mimikyu-i-did-for-a-friend-last-month-mimikyu-hollow-knight-440x501.png')
            .setDescription('**Welcome to HypeMon!** This is a strategic game based off of Pokemon, with aspects of the Tram and Hollow Knight mixed in. To get started, use the command `hm typeselect` to choose a type for your HypeMon. After that, you can take part in HypeBattles for geo and XP, as you strengthen up your HypeMon and gain new opportunities.')
            .setFooter({ text: 'If you have any suggestions, feel free to let Para know!', iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })

        const typesEmbedOne = new EmbedBuilder()
            .setTitle('Types and Type Matchups')
            .setColor('3563A9')
            .setDescription('In HypeMon, there are 5 different types to choose from: **Cursed, Gay, Pure, Foolish, Creative,** and **Savvy.** Each type is strong and weak against one other type. \nAlong with matchups, each type has its own unique passive ability. These abilities affect how each type deals damage most effectively. ')
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })
            .setTimestamp()
            .addFields(
                { name: 'Cursed', value: 'Status effect heavy' },
                { name: 'Gay', value: 'High risk, high reward' },
                { name: 'Pure', value: 'Reliable, steady damage' },
                { name: 'Foolish', value: 'Above average speed and evasion' },
                { name: 'Creative', value: 'Focused on defense and special moves' },
                { name: 'Savvy', value: 'Can combo and manipulate the enemy' }
            )

        const typesEmbedTwo = new EmbedBuilder()
            .setTitle('Types and Type Matchups (cont\'d)')
            .setColor('3563A9')
            .setDescription('As mentioned previously, each type has a strength and a weakness against other types. These will factor into damage and defense during battle. The type matchups are as follows:')
            .setFields(
                { name: 'Cursed', value: 'Strong against: Pure | Weak against: Gay', inline: true },
                { name: 'Gay', value: 'Strong against: Cursed | Weak against: Savvy', inline: true },
                { name: 'Pure', value: 'Strong against: Foolish | Weak against: Cursed', inline: true },
                { name: 'Foolish', value: 'Strong against: Creative | Weak against: Pure', inline: true },
                { name: 'Creative', value: 'Strong against: Savvy | Weak against: Foolish', inline: true },
                { name: 'Savvy', value: 'Strong against: Gay | Weak against: Creative', inline: true },
            )
            .setImage('https://cdn.discordapp.com/attachments/938900493676208160/945121147979173928/d116ff6614b803e6ddd147642ad39963.png')
            .setFooter({ text: `Requested by: ${message.author.username}`, iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })
            .setTimestamp()

        const movesEmbed = new EmbedBuilder()
            .setTitle('Moves and Movesets')
            .setColor('35A97B')
            .setDescription('Each HypeMon is allowed up to 4 moves. These moves can range from all different types, not being restricted to a certain type. However, moves that match the type of the HypeMon will gain an attack bonus. of 10%. Moves that are effective against the opposing HypeMon\'s type will deal 50% more damage.')
            .setFields(
                { name: 'Movesets', value: 'HypeMons can be taught moves through either leveling up or purchase through the shop. HypeMon are not bound to moves that match their type, allowing them access to a wider variety of moves and strategies.', inline: true })
            .setFooter({ text: 'HypeMon help', iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })
            .setTimestamp()

        const lvlsEmbed = new EmbedBuilder()
            .setTitle('Levels, Stats, and EXP')
            .setColor('35A97B')
            .setDescription('Each HypeMon starts off at level 10. From there, completing battles grants exp that lets you level up. Increasing amounts of XP are needed to level up each time. Players also start with 100 stat points to be used in different stat categories. For each stat, 1 stat point = 1 point added into a chosen stat, except for HP, which is 2 stat points for +3 HP.')
            .setFields(
                { name: 'Evolution', value: 'Each HypeMon evolves twice, once at lvl 25 and once again at lvl 40. The first evolution grants them 10 stat points, the second evolution grants them 20 stat points.', inline: true },
                { name: 'Levels', value: 'Every time a HypeMon levels up, you gain 2 stat points, and the level cap is 100.', inline: true },
                { name: 'Stats', value: 'Each Hypemon has 4 stats: ATK, DEF, SPD, HP \nATK: determines how much damage your attacks do \nDEF: reduces damage of received attacks \nSPD: determines the turn order. If your speed is at least 30% higher than your opponent\'s or higher by 10 points, you get a 1% evasion bonus, which goes up another 1% for every 3 points of SPD difference between you and your opponent, capping at a 10% bonus.' }
            )
            .setFooter({ text: 'HypeMon help', iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })
            .setTimestamp()

        const cmdsEmbedOne = new EmbedBuilder()
            .setTitle('HypeMon Bot Commands')
            .setColor('585858')
            .setFooter({ text: 'For more information on a command, use ht help <cmd> (Under development)', iconURL: 'https://pbs.twimg.com/media/DrrcYZIU0AAwywM.jpg' })
            .addFields(
                { name: 'fight', value: 'Fight against other HypeMon with this command.' },
                { name: 'hypedex', value: 'View the HypeDex and its entries' },
                { name: 'profile', value: 'Check out somebody\'s profile and stats' },
                { name: 'shop', value: 'Buy items from the HypeShop with geo' },
                { name: 'typeselect', value: 'Start your HypeMon adventure by choosing your starting type!' }
            )

        //Drop down menu
        const row1 = new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select a topic')
                .addOptions([
                    {
                        label: 'Commands',
                        value: 'help_cmds'
                    },
                    {
                        label: 'Types and Matchups',
                        value: 'help_types'
                    },
                    {
                        label: 'Moves',
                        value: 'help_moves'
                    },
                    {
                        label: 'Levels, Stats & EXP',
                        value: 'help_lvls'
                    },
                    {
                        label: 'Main page',
                        description: 'Return to the main help page',
                        value: 'help_main'
                    }
                ]),
        );

        //End interaction button
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        );

        //Left and right buttons FOR TYPES EMBED + end int
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('◀')
                .setCustomId('left'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('▶')
                .setCustomId('right'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        );

        //Left and right buttons FOR COMMANDS EMBED + end int
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('◀')
                .setCustomId('left1'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('▶')
                .setCustomId('right1'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('End interaction')
                .setCustomId('end_int')
        );

        message.channel.send({ embeds: [helpEmbed], components: [row1] });

        const butCollector = message.channel.createMessageComponentCollector({ filter: filter });

        butCollector.on('collect', async i => {
            if (i.customId === 'end_int') {
                await i.deferUpdate();
                await i.editReply({ components: [] });
                ddCollector.stop();
                butCollector.stop();
            } else if (i.customId === 'left') {
                await i.deferUpdate();
                await i.editReply({ embeds: [typesEmbedOne], components: [row1, row3] })
            } else if (i.customId === 'right') {
                await i.deferUpdate();
                await i.editReply({ embeds: [typesEmbedTwo], components: [row1, row3] })
            }
        });

        const ddCollector = message.channel.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu, idle: 15000 })
        ddCollector.on('collect', async collected => {
            const value = collected.values[0];

            if (value === 'help_types') {
                collected.update({ embeds: [typesEmbedOne], components: [row1, row3] });
            }

            if (value === 'help_moves') {
                collected.update({ embeds: [movesEmbed], components: [row1, row2] });
            }

            if (value === 'help_lvls') {
                collected.update({ embeds: [lvlsEmbed], components: [row1, row2] });
            }

            if (value === 'help_cmds') {
                collected.update({ embeds: [cmdsEmbedOne], components: [row1, row2] });
            }

            if (value === 'help_main') {
                collected.update({ embeds: [helpEmbed], components: [row1, row2] });
            }
        });

        ddCollector.on('end', async collected => {
            butCollector.stop();
        });

    }
}