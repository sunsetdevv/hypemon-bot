const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType, InteractionCollector } = require('discord.js');
const { Players } = require('../database/database.js');

module.exports = {
    name: ['fight', 'battle', 'challenge'],
    async execute(message, args) {
        let fightActive;
        const player1 = message.author;
        const player2 = message.mentions.users.first();
        const player1db = await Players.findOne({ where: { USER_ID: player1.id } });

        if (!player1db) {
            //player 1 is not in database
            message.reply('Please select a type for your HypeMon before battling. Use `hm typeselect` to select a type.');
        } else if (!player2) {
            //no mention for fight
            message.reply('Gotta mention the person you wanna fight with.');
        } else if (player2.id == '1024787285390151792') {
            //cant battle the hypemon bot
            message.reply('Don\'t even think about it.');
        } else if (player2.bot && player2.id != '1024787285390151792') {
            //cant battle a bot
            message.reply('You can\'t fight a bot lol.');
        } else if (player1.id == player2.id) {
            //cant fight yourself
            message.reply('Do I have to explain why you can\'t fight yourself?');
        } else {
            const player2db = await Players.findOne({ where: { USER_ID: player2.id } });

            if (!player2db) {
                //player2 not in database
                message.reply('Your opponent has not selected a type yet!');
            } else {
                if (fightActive) {
                    return message.reply("It looks like there is another fight currently taking place. The combat system will sadly function one at a time until a solution is found; sorry for the inconvenience.");
                }
                //declarations from database
                // PLAYER ONE:
                const p1type = player1db.get('TYPE');
                let p1lvl = player1db.get('LVL');
                let p1exp = player1db.get('EXP');
                let p1geo = player1db.get('GEO');
                const p1move1 = player1db.get('MOVE_ONE');
                let p1m1pp = p1move1.pp;
                const p1move2 = player1db.get('MOVE_TWO');
                let p1m2pp = p1move2.pp;
                const p1move3 = player1db.get('MOVE_THREE');
                let p1m3pp = p1move3.pp;
                const p1hp = player1db.get('HP');
                let cur_p1hp = p1hp;
                let p1atk = player1db.get('ATK');
                let p1def = player1db.get('DEF');
                let p1spd = player1db.get('SPD');
                let p1acc = 0;
                const p1statpoints = player1db.get('STAT_PTS');
                const p1totalgeo = player1db.get('TOTAL_GEO');
                let statEmj1 = ['None'];
                let p1status = {
                    confusion: {
                        active: false,
                        duration: 0
                    },
                    flinch: false,
                    poison: {
                        active: false,
                        duration: 0
                    },
                    paralyze: {
                        active: false,
                        duration: 0
                    },
                    sleep: {
                        active: false,
                        duration: 0
                    },
                    atk: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    def: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    spd: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    acc: {
                        active: false,
                        duration: [],
                        amount: []
                    }
                }

                // PLAYER TWO:
                const p2type = player2db.get('TYPE');
                let p2lvl = player2db.get('LVL');
                let p2exp = player2db.get('EXP');
                let p2geo = player2db.get('GEO');
                const p2move1 = player2db.get('MOVE_ONE');
                let p2m1pp = p1move1.pp;
                const p2move2 = player2db.get('MOVE_TWO');
                let p2m2pp = p1move2.pp;
                const p2move3 = player2db.get('MOVE_THREE');
                let p2m3pp = p1move3.pp;
                const p2hp = player2db.get('HP');
                let cur_p2hp = p2hp;
                let p2atk = player2db.get('ATK');
                let p2def = player2db.get('DEF');
                let p2spd = player2db.get('SPD');
                let p2acc = 0;
                const p2statpoints = player2db.get('STAT_PTS');
                const p2totalgeo = player2db.get('TOTAL_GEO');
                let statEmj2 = ['None'];
                let p2status = {
                    confusion: {
                        active: false,
                        duration: 0
                    },
                    flinch: false,
                    poison: {
                        active: false,
                        duration: 0
                    },
                    paralyze: {
                        active: false,
                        duration: 0
                    },
                    sleep: {
                        active: false,
                        duration: 0
                    },
                    atk: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    def: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    spd: {
                        active: false,
                        duration: [],
                        amount: []
                    },
                    acc: {
                        active: false,
                        duration: [],
                        amount: []
                    }
                }

                //declarations for during the game
                let turnsGoneBy = 0;
                let lastAction = 'No turns have gone by yet.';
                let turn, row, damage, hpBar1, hpBar2, crit, typeAdvOne, typeAdvTwo, levelUp, statGain;
                let p1moves = [];
                let p2moves = [];

                // GAME FUNCTIONS:
                const calcDamage = (p1atk, p2def, power, lvl, type, critAmt) => {
                    damage = Math.ceil(((((((2 * lvl) / 5) + 2) * power * (p1atk / p2def)) / 50) + 2) * critAmt * type);
                }
                const getLastAction = (player, move, dam, turn) => {
                    if (turnsGoneBy >= 1) {
                        let eff;
                        if (typeAdvOne == 1 && typeAdvTwo == 1) {
                            eff = 'effective';
                        } else if (typeAdvOne == 2 && turn == 1) {
                            eff = 'super effective';
                        } else if (typeAdvOne == 0.5 && turn == 1) {
                            eff = 'not very effective';
                        } else if (typeAdvTwo == 2 && turn == 2) {
                            eff = 'super effective';
                        } else if (typeAdvTwo == 0.5 && turn == 2) {
                            eff = 'not very effective';
                        }
                        if (crit == 1) {
                            lastAction = `${player} used ${move}. It was ${eff}, dealing ${dam} damage.`;
                        } else if (crit == 1.5) {
                            lastAction = `Critical hit! ${player} used ${move}. It was ${eff}, dealing ${dam} damage.`;
                        }
                    } else {
                        lastAction = 'No turns have gone by yet.';
                    }
                }
                const hpBarMaker = (hp, maxHP) => {
                    if (hp == maxHP) {//full
                        return '<:LE_full:940777312474001438><:MD_full:940777502434025492><:RE_full:940777646382522428>';
                    } else if (hp != maxHP && hp >= maxHP - (maxHP / 9)) {//8/9
                        return '<:LE_full:940777312474001438><:MD_full:940777502434025492><:RE_2thirds:940777614862331904>';
                    } else if (hp < maxHP - (maxHP / 9) && hp >= maxHP - (2 * (maxHP / 9))) {//7/9
                        return '<:LE_full:940777312474001438><:MD_full:940777502434025492><:RE_1third:940777569433829446>';
                    } else if (hp < maxHP - (2 * (maxHP / 9)) && hp >= maxHP - (3 * (maxHP / 9))) {//6/9
                        return '<:LE_yl:941081540920754257><:MD_yl2:941079996263444519><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP - (3 * (maxHP / 9)) && hp >= maxHP - (4 * (maxHP / 9))) {//5/9
                        return '<:LE_yl:941081540920754257><:MD_yl1:941079987677691964><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP - (4 * (maxHP / 9)) && hp >= maxHP - (5 * (maxHP / 9))) {//4/9
                        return '<:LE_orng1:941079920761765928><:MD_orng2:941079954534334484><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP - (5 * (maxHP / 9)) && hp >= maxHP - (6 * (maxHP / 9))) {//3/9
                        return '<:LE_orng1:941079920761765928><:MD_empty:940777364227518464><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP - (6 * (maxHP / 9)) && hp >= maxHP - (7 * (maxHP / 9))) {//2/9
                        return '<:LE_red2:941079887253479535><:MD_empty:940777364227518464><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP - (7 * (maxHP / 9)) && hp >= maxHP - (8 * (maxHP / 9))) {//1/9
                        return '<:LE_red1:941079848095477860><:MD_empty:940777364227518464><:RE_empty:940777536034603100>';
                    } else if (hp < maxHP / 9 && hp > 0) {//0/9
                        return '<:LE_red1:941079848095477860><:MD_empty:940777364227518464><:RE_empty:940777536034603100>';
                    } else { //death
                        return '<:LE_empty:940777133448523806><:MD_empty:940777364227518464><:RE_empty:940777536034603100>';
                    }
                }
                const getTypeAdv = (type1, type2) => {
                    if (type1 == 'Cursed' && type2 == 'Pure') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Cursed' && type2 == 'Gay') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else if (type1 == 'Gay' && type2 == 'Cursed') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Gay' && type2 == 'Savvy') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else if (type1 == 'Pure' && type2 == 'Foolish') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Pure' && type2 == 'Cursed') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else if (type1 == 'Foolish' && type2 == 'Creative') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Foolish' && type2 == 'Pure') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else if (type1 == 'Savvy' && type2 == 'Gay') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Savvy' && type2 == 'Creative') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else if (type1 == 'Creative' && type2 == 'Savvy') {
                        typeAdvOne = 2;
                        typeAdvTwo = 0.5;
                    } else if (type1 == 'Creative' && type2 == 'Foolish') {
                        typeAdvOne = 0.5;
                        typeAdvTwo = 2;
                    } else {
                        typeAdvOne = 1;
                        typeAdvTwo = 1;
                    }
                }
                const getStatEmj = () => {
                    if (statEmj1.length == 0) {
                        statEmj1 = ['None'];
                    }
                    if (statEmj2.length == 0) {
                        statEmj2 = ['None'];
                    }
                    if (p1status.sleep.active == true) {
                        statEmj1.push('<:hm_asleep:983503608647671838>');
                    }
                    if (p1status.poison.active == true) {
                        statEmj1.push('<:hm_poisoned:983503573511983146>');
                    }
                    if (p1status.paralyze.active == true) {
                        statEmj1.push('<:hm_paralyzed:983503561147174982>');
                    }
                    if (p1status.confusion.active == true) {
                        statEmj1.push('<:hm_confused:983503600573616208>');
                    }
                    if (p1status.atk.active == true) {
                        statEmj1.push(`ATK ${p1status.atk[2]}`);
                    }
                    if (p1status.def.active == true) {
                        statEmj1.push(`DEF ${p1status.def[2]}`);
                    }
                    if (p1status.spd.active == true) {
                        statEmj1.push(`SPD ${p1status.spd[2]}`);
                    }
                    if (p1status.acc.active == true) {
                        statEmj1.push(`ACC ${p1status.acc[2]}`);
                    }
                    if (p1status.sleep.active == false && p1status.poison.active == false && p1status.paralyze.active == false && p1status.confusion.active == false && p1status.atk.active == false && p1status.def.active == false && p1status.spd.active == false && p1status.acc.active == false) {
                        statEmj1 = ['None'];
                    } else {
                        let remove = statEmj1.indexOf('None')
                        statEmj1.splice(remove, 1);
                    }

                    if (p2status.sleep.active == true) {
                        statEmj2.push('<:hm_asleep:983503608647671838>');
                    }
                    if (p2status.poison.active == true) {
                        statEmj2.push('<:hm_poisoned:983503573511983146>');
                    }
                    if (p2status.paralyze.active == true) {
                        statEmj2.push('<:hm_paralyzed:983503561147174982>');
                    }
                    if (p2status.confusion.active == true) {
                        statEmj2.push('<:hm_confused:983503600573616208>');
                    }
                    if (p2status.atk.active == true) {
                        statEmj2.push(`ATK ${p2status.atk[2]}`);
                    }
                    if (p2status.def.active == true) {
                        statEmj2.push(`DEF ${p2status.def[2]}`);
                    }
                    if (p2status.spd.active == true) {
                        statEmj2.push(`SPD ${p2status.spd[2]}`);
                    }
                    if (p2status.acc.active == true) {
                        statEmj2.push(`ACC ${p2status.acc[2]}`);
                    }
                    if (p2status.sleep.active == false && p2status.poison.active == false && p2status.paralyze.active == false && p2status.confusion.active == false && p2status.atk.active == false && p2status.def.active == false && p2status.spd.active == false && p2status.acc.active == false) {
                        statEmj2 = ['None'];
                    } else {
                        let remove = statEmj2.indexOf('None')
                        statEmj2.splice(remove, 1);
                    }
                }
                const expGain = (adv, winLvl, losLvl) => {
                    if (isNaN(adv) || isNaN(winLvl) || isNaN(losLvl)) {
                        return;
                    } else {
                        return Math.ceil(((adv * losLvl) / 5) * (Math.pow(2 * losLvl + 10, 2.5)) / (Math.pow(losLvl + winLvl + 10, 2.5)) + 1) + (winLvl * losLvl) + (winLvl * 2)
                    }
                }
                const checkForLevelUp = (level, exp) => {
                    if (exp >= level * level * level) {
                        levelUp = true;
                    } else {
                        levelUp = false;
                    }
                }
                const geoGain = (winLvl, losLvl) => {
                    if (isNaN(winLvl) || isNaN(losLvl)) {
                        return;
                    } else {
                        return Math.floor((losLvl / winLvl) * ((Math.random() * 10) + 50))
                    }
                }
                const statPointGain = (lvl) => {
                    return lvl * 4;
                }

                // PLAYER ONE ACTION ROW
                let movesRow1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p1move1.name + ' | ' + p1m1pp + ' PP')
                        .setCustomId('move_one')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p1move2.name + ' | ' + p1m2pp + ' PP')
                        .setCustomId('move_two')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p1move3.name + ' | ' + p1m3pp + ' PP')
                        .setCustomId('move_three')
                        .setDisabled(false)
                )

                // PLAYER TWO ACTION ROW
                let movesRow2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p2move1.name + ' | ' + p2m1pp + ' PP')
                        .setCustomId('move_one')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p2move2.name + ' | ' + p2m2pp + ' PP')
                        .setCustomId('move_two')
                        .setDisabled(false),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(p2move3.name + ' | ' + p2m3pp + ' PP')
                        .setCustomId('move_three')
                        .setDisabled(false)
                )

                // CHECKING IF MOVE TWO AND THREE EXIST TO PUT ON BUTTONS
                if (p1move2.name == 'No move assigned') {
                    movesRow1.components[1].setDisabled();
                    movesRow1.components[1].setLabel(p1move2.name);
                }
                if (p1move3.name == 'No move assigned') {
                    movesRow1.components[2].setDisabled();
                    movesRow1.components[2].setLabel(p1move3.name);
                }
                if (p2move2.name == 'No move assigned') {
                    movesRow2.components[1].setDisabled();
                    movesRow2.components[1].setLabel(p2move2.name);
                }
                if (p2move3.name == 'No move assigned') {
                    movesRow2.components[2].setDisabled();
                    movesRow2.components[2].setLabel(p2move3.name);
                }

                if (p1spd > p2spd) { // check to see who goes first
                    turn = player1;
                } else if (p1spd < p2spd) {
                    turn = player2;
                } else if (p1spd == p2spd) {
                    if (Math.random() < 0.5) {
                        turn = player1;
                    } else {
                        turn = player2;
                    }
                }
                hpBar1 = hpBarMaker(cur_p1hp, p1hp);
                hpBar2 = hpBarMaker(cur_p2hp, p2hp);
                if (turn == player1) { // row corresponding to turn
                    row = movesRow1;
                } else if (turn == player2) {
                    row = movesRow2;
                }
                getStatEmj();

                let fightEmbed = new EmbedBuilder()
                    .setAuthor({ name: `${player1.username} vs ${player2.username}` })
                    .setTitle(`${turn.username}'s turn`)
                    .setURL(turn.avatarURL())
                    .setColor('000000')
                    .setThumbnail(turn.avatarURL())
                    .addFields(
                        { name: `${player1.username} (Lvl ${p1lvl}, ${p1type})`, value: `**HP** ${hpBar1 + cur_p1hp}/${p1hp}`, inline: true },
                        { name: 'Status', value: statEmj1.join(''), inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                        { name: `${player2.username} (Lvl ${p2lvl}, ${p2type})`, value: `**HP** ${hpBar2 + cur_p2hp}/${p2hp}`, inline: true },
                        { name: 'Status', value: statEmj2.join(''), inline: true },
                        { name: '\u200B', value: '\u200B', inline: true },
                        { name: 'Last action:', value: lastAction, inline: true }
                    )

                message.channel.send({ embeds: [fightEmbed], components: [row] }).then(msg => {
                    butCollector.on('end', async (collected, reason) => {
                        if (reason == 'idle') {
                            movesRow1.components[0].setDisabled(true);
                            movesRow1.components[1].setDisabled(true);
                            movesRow1.components[2].setDisabled(true);
                            movesRow2.components[0].setDisabled(true);
                            movesRow2.components[1].setDisabled(true);
                            movesRow2.components[2].setDisabled(true);

                            msg.edit({ components: [] });
                            message.channel.send("Time has run out. The battle ends in a draw...");
                        }
                    });
                });

                const turnOne = (move) => {
                    let canMove = true;

                    if (p1status.flinch == true) { //player one flinch
                        canMove = false;
                        p1status.flinch = false;
                        return message.channel.send(`${player1.username} flinched and couldn't move.`).then(m => {
                            setTimeout(() => {
                                m.delete();
                            }, 2000)
                        });
                    } else if (p1status.confusion.active == true) {
                        if (p1status.confusion.duration == 0) { //player one out of confusion
                            //effect lifted
                            p1status.confusion.active = false;
                            let remove = statEmj1.indexOf('<:hm_confused:983503600573616208>');
                            statEmj1.splice(remove, 1);
                            message.channel.send(`${player1.username} snapped out of its confusion.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one confused still
                            //effect inflicted
                            canMove = false;
                            p1status.confusion.duration--;
                            message.channel.send(`${player1.username} is still confused.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                            if (Math.random() < 0.30) {
                                message.channel.send(`${player1.username} hurt itself in confusion!`).then(m => {
                                    setTimeout(() => {
                                        m.delete();
                                    }, 2000)
                                });
                                cur_p1hp -= (0.083333 * p1hp);
                            };
                            return;
                        }
                    } else if (p1status.paralyze.active == true) {
                        if (p1status.paralyze.duration == 0) { //player one no longer paralyzed
                            //effect lifted
                            p1status.paralyze.active = false;
                            let remove = statEmj1.indexOf('<:hm_paralyzed:983503561147174982>');
                            statEmj1.splice(remove, 1);
                            message.channel.send(`${player1.username} is no longer paralyzed.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one still paralyzed
                            //effect inflicted
                            canMove = false;
                            p1status.paralyze.duration--;
                            return message.channel.send(`${player1.username} is paralyzed and cannot move.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p1status.poison.active == true) {
                        if (p1status.poison.duration == 0) { //player one no longer poisoned
                            //effect lifted
                            p1status.poison.active = false;
                            let remove = statEmj1.indexOf('<:hm_poisoned:983503573511983146>');
                            statEmj1.splice(remove, 1);
                            message.channel.send(`${player1.username} was cured of poisoning.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one still poisoned
                            //effect inflicted
                            p1status.poison.duration--;
                            cur_p1hp -= (0.0625 * p1hp);
                            message.channel.send(`${player1.username} was hurt from poison.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p1status.sleep.active == true) {
                        if (p1status.sleep.duration == 0) {
                            //effect lifted
                            p1status.sleep.active = false;
                            let remove = statEmj1.indexOf('<:hm_asleep:983503608647671838>');
                            statEmj1.splice(remove, 1);
                            message.channel.send(`${player1.username} has woken up!`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else {
                            //effect inflicted
                            canMove = false;
                            p1status.sleep.duration--;
                            message.channel.send(`${player1.username} is fast asleep.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p1status.atk.active == true) {
                        if (p1status.atk.duration[p1status.atk.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p1status.atk.active = false;
                            p1status.atk.duration.shift(); //removes last value
                            p1status.atk.amount.shift(); //removes last value
                            p1atk = p1status.atk.amount.reduce((a, b) => a + b, 0); //sets atk to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p1status.atk.duration[p1status.atk.duration - 1] -= 1; //decreases duration by 1
                            p1atk = p1status.atk.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p1status.acc.active == true) {
                        if (p1status.acc.duration[p1status.acc.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p1status.acc.active = false;
                            p1status.acc.duration.shift(); //removes last value
                            p1status.acc.amount.shift(); //removes last value
                            p1acc = p1status.acc.amount.reduce((a, b) => a + b, 0); //sets acc to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p1status.acc.duration[p1status.acc.duration - 1] -= 1; //decreases duration by 1
                            p1acc = p1status.acc.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p1status.def.active == true) {
                        if (p1status.def.duration[p1status.def.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p1status.def.active = false;
                            p1status.def.duration.shift(); //removes last value
                            p1status.def.amount.shift(); //removes last value
                            p1def = p1status.def.amount.reduce((a, b) => a + b, 0); //sets def to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p1status.def.duration[p1status.def.duration - 1] -= 1; //decreases duration by 1
                            p1def = p1status.def.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p1status.spd.active == true) {
                        if (p1status.spd.duration[p1status.spd.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p1status.spd.active = false;
                            p1status.spd.duration.shift(); //removes last value
                            p1status.spd.amount.shift(); //removes last value
                            p1spd = p1status.spd.amount.reduce((a, b) => a + b, 0); //sets spd to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p1status.spd.duration[p1status.spd.duration - 1] -= 1; //decreases duration by 1
                            p1spd = p1status.spd.amount.reduce((a, b) => a + b, 0);
                        }
                    }

                    if (canMove) { // PLAYER ONE. GET A GRIP ON YOURSELF
                        if (move.pp == 0) {
                            return message.channel.send(move.name + ' is out of PP.').then(msg => {
                                setTimeout(() => {
                                    msg.delete();
                                }, 2000)
                            });
                        }

                        player1db.increment('MOVES_USED');

                        if (Math.random() < (move.accuracy - p1acc)) {
                            //general attack hit
                            move.pp--;
                            if (move.category == 'attack') {
                                if (move.hasOwnProperty('effectType') && Math.random() < move.effectChance) {
                                    //move has status effect and chance test passed
                                    if (move.effectType == 'ACC' || move.effectType == 'ATK' || move.effectType == 'DEF' || move.effectType == 'SPD') {
                                        if (move.name == 'Quiz') {
                                            //special move

                                        } else if (move.name == 'Alt account') {
                                            p1status.def.duration.push(move.effectDur);
                                            p1status.def.amount.push(move.effectAmt);

                                            if (Math.random() < 0.10) {
                                                crit = 1.5;
                                            } else {
                                                crit = 1;
                                            }
                                            getTypeAdv(move.type, p2type);
                                            calcDamage(p1atk, p2def, move.power, p1lvl, typeAdvOne, crit);
                                            cur_p2hp -= damage;
                                            if (cur_p2hp <= 0) {
                                                cur_p2hp = 0;
                                            }
                                            hpBar2 = hpBarMaker(cur_p2hp, p2hp);
                                            getLastAction(player1.username, move.name, damage, 1);
                                        } else {
                                            //attack move with AADS effect
                                            if (Math.random() < 0.10) {
                                                crit = 1.5;
                                            } else {
                                                crit = 1;
                                            }
                                            getTypeAdv(move.type, p2type);
                                            calcDamage(p1atk, p2def, move.power, p1lvl, typeAdvOne, crit);
                                            cur_p2hp -= damage;
                                            if (cur_p2hp <= 0) {
                                                cur_p2hp = 0;
                                            }
                                            hpBar2 = hpBarMaker(cur_p2hp, p2hp);
                                            getLastAction(player1.username, move.name, damage, 1);

                                            switch (move.effectType) {
                                                case 'ATK':
                                                    if (p1status.atk.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.atk.active = true;
                                                    p1status.atk.duration.push(move.effectDur);
                                                    p1status.atk.amount.push(move.effectAmt);
                                                    break;
                                                case 'ACC':
                                                    if (p1status.acc.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.acc.active = true;
                                                    p1status.acc.duration.push(move.effectDur);
                                                    p1status.acc.amount.push(move.effectAmt);
                                                    break;
                                                case 'DEF':
                                                    if (p1status.def.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.def.active = true;
                                                    p1status.def.duration.push(move.effectDur);
                                                    p1status.def.amount.push(move.effectAmt);
                                                    break;
                                                case 'SPD':
                                                    if (p1status.spd.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.spd.active = true;
                                                    p1status.spd.duration.push(move.effectDur);
                                                    p1status.spd.amount.push(move.effectAmt);
                                                    break;
                                            }
                                        }
                                    } else {
                                        //attack move with CFHPPS effect
                                        if (Math.random() < 0.10) {
                                            crit = 1.5;
                                        } else {
                                            crit = 1;
                                        }
                                        getTypeAdv(move.type, p2type);
                                        calcDamage(p1atk, p2def, move.power, p1lvl, typeAdvOne, crit);
                                        cur_p2hp -= damage;
                                        if (cur_p2hp <= 0) {
                                            cur_p2hp = 0;
                                        }
                                        hpBar2 = hpBarMaker(cur_p2hp, p2hp);

                                        if (move.effectType == 'Flinch') {
                                            p2status.flinch = true;
                                        } else if (move.effectType == 'Confusion') {
                                            if (p2status.confusion.active == true) { //check if already has effect
                                                return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p2status.confusion.active = true;
                                            p2status.confusion.duration = move.effectDur;
                                            lastAction = `${player1.username} used ${move.name}. ${player2.username} became confused!`;
                                        } else if (move.effectType == 'Paralyze') {
                                            if (p2status.paralyze.active == true) { //check if already has effect
                                                return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p2status.paralyze.active = true;
                                            p2status.paralyze.duration = move.effectDur;
                                            lastAction = `${player1.username} used ${move.name}. ${player2.username} is now paralyzed!`;
                                        } else if (move.effectType == 'Poison') {
                                            if (p2status.poison.active == true) { //check if already has effect
                                                return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p2status.poison.active = true;
                                            p2status.poison.duration = move.effectDur;
                                            lastAction = `${player1.username} used ${move.name}. ${player2.username} is now poisoned.`;
                                        } else if (move.effectType == 'Sleep') {
                                            if (p2status.sleep.active == true) { //check if already has effect
                                                return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p2status.sleep.active = true;
                                            p2status.sleep.duration = move.effectDur;
                                            lastAction = `${player1.username} used ${move.name}. ${player2.username} has fallen asleep.`;
                                        } else if (move.effectType == 'Heal') {
                                            //check for vore
                                            if (move.name == 'Vore') {
                                                p1hp += damage / 2;
                                                hpBar1 = hpBarMaker(cur_p1hp, p1hp);
                                            }
                                        }
                                    }
                                } else {
                                    //attack move with no effects
                                    if (Math.random() < 0.10) {
                                        crit = 1.5;
                                    } else {
                                        crit = 1;
                                    }
                                    getTypeAdv(move.type, p2type);
                                    calcDamage(p1atk, p2def, move.power, p1lvl, typeAdvOne, crit);
                                    cur_p2hp -= damage;
                                    if (cur_p2hp <= 0) {
                                        cur_p2hp = 0;
                                    }
                                    hpBar2 = hpBarMaker(cur_p2hp, p2hp);
                                    getLastAction(player1.username, move.name, damage, 1);
                                }
                            } else if (move.category == 'status') {
                                if (move.name == "Practice Sketch") {
                                    //special move, two affected stats
                                    if (p2status.atk.duration.length == 3) {
                                        return;
                                    } else {
                                        p2status.atk.duration = move.effectDur;
                                        p2status.atk.amount = move.effectAmt;
                                    }

                                    if (p2status.acc.duration.length == 3) {
                                        return;
                                    } else {
                                        p2status.acc.duration = move.effectDur;
                                        p2status.acc.amount = move.effectAmt;
                                    }
                                } else if (move.name == "Perms Switch") {
                                    //special move, swaps atk stats of players
                                    let temp = p1atk;
                                    p1atk = p2atk;
                                    p2atk = temp;
                                } else if (move.effectType == 'ACC' || move.effectType == 'ATK' || move.effectType == 'DEF' || move.effectType == 'SPD') {
                                    //status move with AADS effect
                                    if (target == 1) {
                                        //affects player one
                                        switch (move.effectType) {
                                            case 'ATK':
                                                if (p1status.atk.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.atk.active = true;
                                                p1status.atk.duration.push(move.effectDur);
                                                p1status.atk.amount.push(move.effectAmt);
                                                break;
                                            case 'ACC':
                                                if (p1status.acc.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.acc.active = true;
                                                p1status.acc.duration.push(move.effectDur);
                                                p1status.acc.amount.push(move.effectAmt);
                                                break;
                                            case 'DEF':
                                                if (p1status.def.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.def.active = true;
                                                p1status.def.duration.push(move.effectDur);
                                                p1status.def.amount.push(move.effectAmt);
                                                break;
                                            case 'SPD':
                                                if (p1status.spd.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.spd.active = true;
                                                p1status.spd.duration.push(move.effectDur);
                                                p1status.spd.amount.push(move.effectAmt);
                                                break;
                                        }
                                    } else if (target == 2) {
                                        //affects player two
                                        switch (move.effectType) {
                                            case 'ATK':
                                                if (p2status.atk.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.atk.active = true;
                                                p2status.atk.duration.push(move.effectDur);
                                                p2status.atk.amount.push(move.effectAmt);
                                                break;
                                            case 'ACC':
                                                if (p2status.acc.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.acc.active = true;
                                                p2status.acc.duration.push(move.effectDur);
                                                p2status.acc.amount.push(move.effectAmt);
                                                break;
                                            case 'DEF':
                                                if (p2status.def.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.def.active = true;
                                                p2status.def.duration.push(move.effectDur);
                                                p2status.def.amount.push(move.effectAmt);
                                                break;
                                            case 'SPD':
                                                if (p2status.spd.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.spd.active = true;
                                                p2status.spd.duration.push(move.effectDur);
                                                p2status.spd.amount.push(move.effectAmt);
                                                break;
                                        }
                                    }
                                } else {
                                    //status move with CFHPPS effect
                                    if (move.effectType == 'Confusion') {
                                        if (p2status.confusion.active == true) { //check if already has effect
                                            return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p2status.confusion.active = true;
                                        p2status.confusion.duration = move.effectDur;
                                        lastAction = `${player1.username} used ${move.name}. ${player2.username} became confused!`;
                                    } else if (move.effectType == 'Paralyze') {
                                        if (p2status.paralyze.active == true) { //check if already has effect
                                            return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p2status.paralyze.active = true;
                                        p2status.paralyze.duration = move.effectDur;
                                        lastAction = `${player1.username} used ${move.name}. ${player2.username} is now paralyzed!`;
                                    } else if (move.effectType == 'Poison') {
                                        if (p2status.poison.active == true) { //check if already has effect
                                            return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p2status.poison.active = true;
                                        p2status.poison.duration = move.effectDur;
                                        lastAction = `${player1.username} used ${move.name}. ${player2.username} is now poisoned.`;
                                    } else if (move.effectType == 'Sleep') {
                                        if (p2status.sleep.active == true) { //check if already has effect
                                            return message.channel.send(`${player2.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p2status.sleep.active = true;
                                        p2status.sleep.duration = move.effectDur;
                                        lastAction = `${player1.username} used ${move.name}. ${player2.username} has fallen asleep.`;
                                    } else if (move.effectType == 'Heal') {
                                        if (move.name == "Soothing Art Session") {
                                            cur_p1hp += (p1hp / 2);
                                        }
                                    }
                                }
                            }
                            if (move.name == "Ze'mer's Gay Nail") {
                                //recoil
                                cur_p1hp -= damage / 4;
                            }
                        } else {
                            //general attack miss
                            if (move.name == "I Ship It") {
                                cur_p1hp -= (p1hp / 2);
                            }
                            lastAction = `${player1.username} used ${move.name}, but missed.`;
                            return;
                        }
                    }
                }

                const turnTwo = (move) => {
                    let canMove = true;

                    if (p2status.flinch == true) { //player one flinch
                        canMove = false;
                        p2status.flinch = false;
                        return message.channel.send(`${player2.username} flinched and couldn't move.`).then(m => {
                            setTimeout(() => {
                                m.delete();
                            }, 2000)
                        });
                    } else if (p2status.confusion.active == true) {
                        if (p2status.confusion.duration == 0) { //player one out of confusion
                            //effect lifted
                            p2status.confusion.active = false;
                            let remove = statEmj2.indexOf('<:hm_confused:983503600573616208>');
                            statEmj2.splice(remove, 1);
                            message.channel.send(`${player2.username} snapped out of its confusion.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one confused still
                            //effect inflicted
                            canMove = false;
                            p2status.confusion.duration--;
                            message.channel.send(`${player2.username} is still confused.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                            if (Math.random() < 0.30) {
                                message.channel.send(`${player2.username} hurt itself in confusion!`).then(m => {
                                    setTimeout(() => {
                                        m.delete();
                                    }, 2000)
                                });
                                cur_p2hp -= (0.083333 * p2hp);
                            };
                            return;
                        }
                    } else if (p2status.paralyze.active == true) {
                        if (p2status.paralyze.duration == 0) { //player one no longer paralyzed
                            //effect lifted
                            p2status.paralyze.active = false;
                            let remove = statEmj2.indexOf('<:hm_paralyzed:983503561147174982>');
                            statEmj2.splice(remove, 1);
                            message.channel.send(`${player2.username} is no longer paralyzed.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one still paralyzed
                            //effect inflicted
                            canMove = false;
                            p2status.paralyze.duration--;
                            return message.channel.send(`${player2.username} is paralyzed and cannot move.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p2status.poison.active == true) {
                        if (p2status.poison.duration == 0) { //player one no longer poisoned
                            //effect lifted
                            p2status.poison.active = false;
                            let remove = statEmj2.indexOf('<:hm_poisoned:983503573511983146>');
                            statEmj2.splice(remove, 1);
                            message.channel.send(`${player2.username} was cured of poisoning.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else { //player one still poisoned
                            //effect inflicted
                            p2status.poison.duration--;
                            cur_p2hp -= (0.0625 * p2hp);
                            message.channel.send(`${player2.username} was hurt from poison.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p2status.sleep.active == true) {
                        if (p2status.sleep.duration == 0) {
                            //effect lifted
                            p2status.sleep.active = false;
                            let remove = statEmj2.indexOf('<:hm_asleep:983503608647671838>');
                            statEmj2.splice(remove, 1);
                            message.channel.send(`${player2.username} has woken up!`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        } else {
                            //effect inflicted
                            canMove = false;
                            p2status.sleep.duration--;
                            message.channel.send(`${player2.username} is fast asleep.`).then(m => {
                                setTimeout(() => {
                                    m.delete();
                                }, 2000)
                            });
                        }
                    } else if (p2status.atk.active == true) {
                        if (p2status.atk.duration[p2status.atk.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p2status.atk.active = false;
                            p2status.atk.duration.shift(); //removes last value
                            p2status.atk.amount.shift(); //removes last value
                            p1atk = p2status.atk.amount.reduce((a, b) => a + b, 0); //sets atk to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p2status.atk.duration[p2status.atk.duration - 1] -= 1; //decreases duration by 1
                            p1atk = p2status.atk.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p2status.acc.active == true) {
                        if (p2status.acc.duration[p2status.acc.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p2status.acc.active = false;
                            p2status.acc.duration.shift(); //removes last value
                            p2status.acc.amount.shift(); //removes last value
                            p1acc = p2status.aacctk.amount.reduce((a, b) => a + b, 0); //sets acc to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p2status.acc.duration[p2status.acc.duration - 1] -= 1; //decreases duration by 1
                            p1acc = p2status.acc.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p2status.def.active == true) {
                        if (p2status.def.duration[p2status.def.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p2status.def.active = false;
                            p2status.def.duration.shift(); //removes last value
                            p2status.def.amount.shift(); //removes last value
                            p1def = p2status.def.amount.reduce((a, b) => a + b, 0); //sets def to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p2status.def.duration[p2status.def.duration - 1] -= 1; //decreases duration by 1
                            p1def = p2status.def.amount.reduce((a, b) => a + b, 0);
                        }
                    } else if (p2status.spd.active == true) {
                        if (p2status.spd.duration[p2status.spd.duration.length - 1] == 0) {
                            //last value in duration array is 0, effect lifted
                            p2status.spd.active = false;
                            p2status.spd.duration.shift(); //removes last value
                            p2status.spd.amount.shift(); //removes last value
                            p1spd = p2status.spd.amount.reduce((a, b) => a + b, 0); //sets spd to sum of values in array
                        } else {
                            //last value != 0, length minus one
                            p2status.spd.duration[p2status.spd.duration - 1] -= 1; //decreases duration by 1
                            p1spd = p2status.spd.amount.reduce((a, b) => a + b, 0);
                        } statEmj2
                    }

                    if (canMove) { //PLAYER TWO. YOURE FADING
                        if (move.pp == 0) {
                            return message.channel.send(move.name + ' is out of PP.').then(msg => {
                                setTimeout(() => {
                                    msg.delete();
                                }, 2000)
                            });
                        }

                        player2db.increment('MOVES_USED');

                        if (Math.random() < (move.accuracy - p2acc)) {
                            //general attack hit
                            move.pp--;
                            if (move.category == 'attack') {
                                if (move.hasOwnProperty('effectType') && Math.random() < move.effectChance) {
                                    //move has status effect and chance test passed
                                    if (move.effectType == 'ACC' || move.effectType == 'ATK' || move.effectType == 'DEF' || move.effectType == 'SPD') {
                                        if (move.name == 'Quiz') {
                                            //special move

                                        } else if (move.name == 'Alt account') {
                                            p2status.def.duration.push(move.effectDur);
                                            p2status.def.amount.push(move.effectAmt);

                                            if (Math.random() < 0.10) {
                                                crit = 1.5;
                                            } else {
                                                crit = 1;
                                            }
                                            getTypeAdv(move.type, p1type);
                                            calcDamage(p2atk, p1def, move.power, p2lvl, typeAdvTwo, crit);
                                            cur_p1hp -= damage;
                                            if (cur_p1hp <= 0) {
                                                cur_p1hp = 0;
                                            }
                                            hpBar1 = hpBarMaker(cur_p1hp, p1hp);
                                            getLastAction(player2.username, move.name, damage, 2);
                                        } else {
                                            //attack move with AADS effect
                                            if (Math.random() < 0.10) {
                                                crit = 1.5;
                                            } else {
                                                crit = 1;
                                            }
                                            getTypeAdv(move.type, p1type);
                                            calcDamage(p2atk, p1def, move.power, p2lvl, typeAdvTwo, crit);
                                            cur_p1hp -= damage;
                                            if (cur_p1hp <= 0) {
                                                cur_p1hp = 0;
                                            }
                                            hpBar1 = hpBarMaker(cur_p1hp, p1hp);
                                            getLastAction(player2.username, move.name, damage, 2);

                                            switch (move.effectType) {
                                                case 'ATK':
                                                    if (p1status.atk.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.atk.active = true;
                                                    p1status.atk.duration.push(move.effectDur);
                                                    p1status.atk.amount.push(move.effectAmt);
                                                    break;
                                                case 'ACC':
                                                    if (p1status.acc.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.acc.active = true;
                                                    p1status.acc.duration.push(move.effectDur);
                                                    p1status.acc.amount.push(move.effectAmt);
                                                    break;
                                                case 'DEF':
                                                    if (p1status.def.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.def.active = true;
                                                    p1status.def.duration.push(move.effectDur);
                                                    p1status.def.amount.push(move.effectAmt);
                                                    break;
                                                case 'SPD':
                                                    if (p1status.spd.duration.length == 3) {
                                                        return;
                                                    }
                                                    p1status.spd.active = true;
                                                    p1status.spd.duration.push(move.effectDur);
                                                    p1status.spd.amount.push(move.effectAmt);
                                                    break;
                                            }
                                        }
                                    } else {
                                        //attack move with CFHPPS effect
                                        if (Math.random() < 0.10) {
                                            crit = 1.5;
                                        } else {
                                            crit = 1;
                                        }
                                        getTypeAdv(move.type, p1type);
                                        calcDamage(p2atk, p1def, move.power, p2lvl, typeAdvTwo, crit);
                                        cur_p1hp -= damage;
                                        if (cur_p1hp <= 0) {
                                            cur_p1hp = 0;
                                        }
                                        hpBar1 = hpBarMaker(cur_p1hp, p1hp);

                                        if (move.effectType == 'Flinch') {
                                            p1status.flinch = true;
                                        } else if (move.effectType == 'Confusion') {
                                            if (p1status.confusion.active == true) { //check if already has effect
                                                return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p1status.confusion.active = true;
                                            p1status.confusion.duration = move.effectDur;
                                            lastAction = `${player2.username} used ${move.name}. ${player1.username} became confused!`;
                                        } else if (move.effectType == 'Paralyze') {
                                            if (p1status.paralyze.active == true) { //check if already has effect
                                                return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p1status.paralyze.active = true;
                                            p1status.paralyze.duration = move.effectDur;
                                            lastAction = `${player2.username} used ${move.name}. ${player1.username} is now paralyzed!`;
                                        } else if (move.effectType == 'Poison') {
                                            if (p1status.poison.active == true) { //check if already has effect
                                                return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p1status.poison.active = true;
                                            p1status.poison.duration = move.effectDur;
                                            lastAction = `${player2.username} used ${move.name}. ${player1.username} is now poisoned.`;
                                        } else if (move.effectType == 'Sleep') {
                                            if (p1status.sleep.active == true) { //check if already has effect
                                                return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                    setTimeout(() => {
                                                        msg.delete();
                                                    }, 2000);
                                                });
                                            }
                                            p1status.sleep.active = true;
                                            p1status.sleep.duration = move.effectDur;
                                            lastAction = `${player2.username} used ${move.name}. ${player1.username} has fallen asleep.`;
                                        } else if (move.effectType == 'Heal') {
                                            //check for vore
                                            if (move.name == 'Vore') {
                                                p2hp += damage / 2;
                                                hpBar2 = hpBarMaker(cur_p2hp, p2hp);
                                            }
                                        }
                                    }
                                } else {
                                    //attack move with no effects
                                    if (Math.random() < 0.10) {
                                        crit = 1.5;
                                    } else {
                                        crit = 1;
                                    }
                                    getTypeAdv(move.type, p1type);
                                    calcDamage(p2atk, p1def, move.power, p2lvl, typeAdvTwo, crit);
                                    cur_p1hp -= damage;
                                    if (cur_p1hp <= 0) {
                                        cur_p1hp = 0;
                                    }
                                    hpBar1 = hpBarMaker(cur_p1hp, p1hp);
                                    getLastAction(player2.username, move.name, damage, 2);
                                }
                            } else if (move.category == 'status') {
                                if (move.name == "Practice Sketch") {
                                    //special move, two affected stats
                                    if (p1status.atk.duration.length == 3) {
                                        return;
                                    } else {
                                        p1status.atk.duration = move.effectDur;
                                        p1status.atk.amount = move.effectAmt;
                                    }

                                    if (p1status.acc.duration.length == 3) {
                                        return;
                                    } else {
                                        p1status.acc.duration = move.effectDur;
                                        p1status.acc.amount = move.effectAmt;
                                    }
                                } else if (move.name == "Perms Switch") {
                                    //special move, swaps atk stats of players
                                    let temp = p1atk;
                                    p1atk = p2atk;
                                    p2atk = temp;
                                } else if (move.effectType == 'ACC' || move.effectType == 'ATK' || move.effectType == 'DEF' || move.effectType == 'SPD') {
                                    //status move with AADS effect
                                    if (target == 1) {
                                        //affects player two
                                        switch (move.effectType) {
                                            case 'ATK':
                                                if (p2status.atk.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.atk.active = true;
                                                p2status.atk.duration.push(move.effectDur);
                                                p2status.atk.amount.push(move.effectAmt);
                                                break;
                                            case 'ACC':
                                                if (p2status.acc.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.acc.active = true;
                                                p2status.acc.duration.push(move.effectDur);
                                                p2status.acc.amount.push(move.effectAmt);
                                                break;
                                            case 'DEF':
                                                if (p2status.def.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.def.active = true;
                                                p2status.def.duration.push(move.effectDur);
                                                p2status.def.amount.push(move.effectAmt);
                                                break;
                                            case 'SPD':
                                                if (p2status.spd.duration.length == 3) {
                                                    return;
                                                }
                                                p2status.spd.active = true;
                                                p2status.spd.duration.push(move.effectDur);
                                                p2status.spd.amount.push(move.effectAmt);
                                                break;
                                        }
                                    } else if (target == 2) {
                                        //affects player one
                                        switch (move.effectType) {
                                            case 'ATK':
                                                if (p1status.atk.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.atk.active = true;
                                                p1status.atk.duration.push(move.effectDur);
                                                p1status.atk.amount.push(move.effectAmt);
                                                break;
                                            case 'ACC':
                                                if (p1status.acc.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.acc.active = true;
                                                p1status.acc.duration.push(move.effectDur);
                                                p1status.acc.amount.push(move.effectAmt);
                                                break;
                                            case 'DEF':
                                                if (p1status.def.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.def.active = true;
                                                p1status.def.duration.push(move.effectDur);
                                                p1status.def.amount.push(move.effectAmt);
                                                break;
                                            case 'SPD':
                                                if (p1status.spd.duration.length == 3) {
                                                    return;
                                                }
                                                p1status.spd.active = true;
                                                p1status.spd.duration.push(move.effectDur);
                                                p1status.spd.amount.push(move.effectAmt);
                                                break;
                                        }
                                    }
                                } else {
                                    //status move with CFHPPS effect
                                    if (move.effectType == 'Confusion') {
                                        if (p1status.confusion.active == true) { //check if already has effect
                                            return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p1status.confusion.active = true;
                                        p1status.confusion.duration = move.effectDur;
                                        lastAction = `${player2.username} used ${move.name}. ${player1.username} became confused!`;
                                    } else if (move.effectType == 'Paralyze') {
                                        if (p1status.paralyze.active == true) { //check if already has effect
                                            return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p1status.paralyze.active = true;
                                        p1status.paralyze.duration = move.effectDur;
                                        lastAction = `${player2.username} used ${move.name}. ${player1.username} is now paralyzed!`;
                                    } else if (move.effectType == 'Poison') {
                                        if (p1status.poison.active == true) { //check if already has effect
                                            return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p1status.poison.active = true;
                                        p1status.poison.duration = move.effectDur;
                                        lastAction = `${player2.username} used ${move.name}. ${player1.username} is now poisoned.`;
                                    } else if (move.effectType == 'Sleep') {
                                        if (p1status.sleep.active == true) { //check if already has effect
                                            return message.channel.send(`${player1.username} already has that effect!`).then(msg => {
                                                setTimeout(() => {
                                                    msg.delete();
                                                }, 2000);
                                            });
                                        }
                                        p1status.sleep.active = true;
                                        p1status.sleep.duration = move.effectDur;
                                        lastAction = `${player2.username} used ${move.name}. ${player1.username} has fallen asleep.`;
                                    } else if (move.effectType == 'Heal') {
                                        if (move.name == "Soothing Art Session") {
                                            cur_p2hp += (p2hp / 2);
                                        }
                                    }
                                }
                            }
                            if (move.name == "Ze'mer's Gay Nail") {
                                //recoil
                                cur_p2hp -= damage / 4;
                            }
                        } else {
                            //general attack miss
                            if (move.name == "I Ship It") {
                                cur_p2hp -= (p2hp / 2);
                            }
                            lastAction = `${player2.username} used ${move.name}, but missed.`;
                            return;
                        }
                    }
                }

                //create collecter for message
                const butCollector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button, idle: 20000 });

                butCollector.on('collect', async i => {
                    if (i.user.id !== turn.id) {
                        i.reply({ content: `It's not your turn.`, ephemeral: true })
                        return;
                    } else {
                        turnsGoneBy++;
                        if (turn.id == player1.id) {
                            if (i.customId === 'move_one') {
                                //player one move one
                                await i.deferUpdate();
                                turnOne(p1move1);
                                if (p1move1.pp == 5) movesRow1.components[0].setStyle(ButtonStyle.Secondary);
                                if (p1move1.pp == 0) movesRow1.components[0].setStyle(ButtonStyle.Danger);
                                movesRow1.components[0].setLabel(`${p1move1.name} | ${p1move1.pp} PP`);
                                p1moves.push(p1move1.name);
                            } else if (i.customId === 'move_two') {
                                //player one move two
                                await i.deferUpdate();
                                turnOne(p1move2);
                                if (p1move2.pp == 5) movesRow1.components[0].setStyle(ButtonStyle.Secondary);
                                if (p1move2.pp == 0) movesRow1.components[0].setStyle(ButtonStyle.Danger);
                                movesRow1.components[1].setLabel(`${p1move2.name} | ${p1move2.pp} PP`);
                                p1moves.push(p1move2.name);
                            } else if (i.customId === 'move_three') {
                                //player one move three
                                await i.deferUpdate();
                                turnOne(p1move3);
                                if (p1move3.pp == 5) movesRow1.components[0].setStyle(ButtonStyle.Secondary);
                                if (p1move3.pp == 0) movesRow1.components[0].setStyle(ButtonStyle.Danger);
                                movesRow1.components[2].setLabel(`${p1move3.name} | ${p1move3.pp} PP`);
                                p1moves.push(p1move3.name);
                            }
                            turn = player2;
                            const receivedEmbed = message.embeds[0];
                            const newFightEmbed = EmbedBuilder.from(receivedEmbed)
                                .setAuthor({ name: player1.username + ` (${p1type}) vs ` + player2.username + ` (${p2type})` })
                                .setTitle(`${turn.username}'s turn`)
                                .setURL(turn.avatarURL())
                                .setColor('000000')
                                .setThumbnail(turn.avatarURL())
                                .addFields(
                                    { name: `${player1.username} (Lvl ${p1lvl}, ${p1type})`, value: `**HP** ${hpBar1 + cur_p1hp}/${p1hp}`, inline: true },
                                    { name: 'Status', value: statEmj1.join(''), inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: `${player2.username} (Lvl ${p2lvl}, ${p2type})`, value: `**HP** ${hpBar2 + cur_p2hp}/${p2hp}`, inline: true },
                                    { name: 'Status', value: statEmj2.join(''), inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: 'Last action:', value: lastAction, inline: true }
                                )
                            await i.editReply({ embeds: [newFightEmbed], components: [movesRow2] });
                        } else if (turn.id == player2.id) {
                            if (i.customId === 'move_one') {
                                //player two move one
                                await i.deferUpdate();
                                turnTwo(p2move1);
                                if (p2move1.pp == 5) movesRow2.components[0].setStyle(ButtonStyle.Secondary);
                                if (p2move1.pp == 0) movesRow2.components[0].setStyle(ButtonStyle.Danger);
                                movesRow2.components[0].setLabel(`${p2move1.name} | ${p2move1.pp} PP`);
                                p2moves.push(p2move1.name);
                            } else if (i.customId === 'move_two') {
                                //player two move two
                                await i.deferUpdate();
                                turnTwo(p2move2);
                                if (p2move2.pp == 5) movesRow2.components[0].setStyle(ButtonStyle.Secondary);
                                if (p2move2.pp == 0) movesRow2.components[0].setStyle(ButtonStyle.Danger);
                                movesRow2.components[1].setLabel(`${p2move2.name} | ${p2move2.pp} PP`);
                                p2moves.push(p2move2.name);
                            } else if (i.customId === 'move_three') {
                                //player two move three
                                await i.deferUpdate();
                                turnTwo(p2move3);
                                if (p2move3.pp == 5) movesRow2.components[0].setStyle(ButtonStyle.Secondary);
                                if (p2move3.pp == 0) movesRow2.components[0].setStyle(ButtonStyle.Danger);
                                movesRow2.components[2].setLabel(`${p2move3.name} | ${p2move3.pp} PP`);
                                p2moves.push(p2move3.name);
                            }
                            turn = player1;
                            const receivedEmbed = message.embeds[0];
                            const newFightEmbed = EmbedBuilder.from(receivedEmbed)
                                .setAuthor({ name: player1.username + ` (${p1type}) vs ` + player2.username + ` (${p2type})` })
                                .setTitle(`${turn.username}'s turn`)
                                .setURL(turn.avatarURL())
                                .setColor('000000')
                                .setThumbnail(turn.avatarURL())
                                .addFields(
                                    { name: `${player1.username} (Lvl ${p1lvl}, ${p1type})`, value: `**HP** ${hpBar1 + cur_p1hp}/${p1hp}`, inline: true },
                                    { name: 'Status', value: statEmj1.join(''), inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: `${player2.username} (Lvl ${p2lvl}, ${p2type})`, value: `**HP** ${hpBar2 + cur_p2hp}/${p2hp}`, inline: true },
                                    { name: 'Status', value: statEmj2.join(''), inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: 'Last action:', value: lastAction, inline: true }
                                )
                            await i.editReply({ embeds: [newFightEmbed], components: [movesRow1] });
                        }
                        if (cur_p1hp <= 0 || cur_p2hp <= 0) { //someone loses
                            i.editReply({ components: [] });
                            butCollector.stop();
                            fightActive = false;

                            //updating moves in database for favorite move
                            const favUpdate1 = await Players.update({
                                FAV_MOVE: p1moves
                            }, { where: { USER_ID: player1.id } });

                            const favUpdate2 = await Players.update({
                                FAV_MOVE: p2moves
                            }, { where: { USER_ID: player2.id } });


                            if (cur_p1hp <= 0) { // player 2 wins
                                //reset player 1 winstreak
                                const resetWinStrk1 = await Players.update({ WINSTREAK: 0 }, { where: { USER_ID: player1.id } });
                                //player 2 stuff
                                const exp2 = expGain(typeAdvTwo, p2lvl, p1lvl);
                                const geo2 = geoGain(p2lvl, p1lvl);
                                checkForLevelUp(p2lvl + 1, p2exp + exp2);
                                //victory embed
                                const victoryEmbed = new EmbedBuilder()
                                    .setTitle(`${player2.username} has won the battle against ${player1.username}!`)
                                    .setColor('Gold')
                                    .setThumbnail(player2.avatarURL())
                                    .setFooter({ text: `Total battle turns: ${turnsGoneBy}`, iconURL: 'https://cdn.discordapp.com/attachments/983502820248551504/1025976378308427796/pvoasdva.png' })
                                    .setDescription(`${player2.username} has gained \`${exp2}\` XP along with a reward of **${geo2}** geo!`)

                                message.channel.send({ embeds: [victoryEmbed] });

                                if (levelUp) {
                                    //db update, with level up
                                    statGain = statPointGain(p2lvl);
                                    message.channel.send(`<@${player2.id}> is now level **${p2lvl + 1}**, and has earned ${statGain} stat points!`);

                                    const updatep2 = await Players.update({
                                        EXP: p2exp + exp2,
                                        GEO: p2geo + geo2,
                                        STAT_PTS: p2statpoints + statGain,
                                        TOTAL_GEO: p2totalgeo + geo2
                                    }, { where: { USER_ID: player2.id } });

                                    player2db.increment('LVL');
                                } else {
                                    //db update, no level up
                                    const updatep2 = await Players.update({
                                        EXP: p2exp + exp2,
                                        GEO: p2geo + geo2,
                                        TOTAL_GEO: p2totalgeo + geo2
                                    }, { where: { USER_ID: player2.id } });
                                }
                                player2db.increment('BTLS_WON');
                                player2db.increment('WINSTREAK');
                            } else if (cur_p2hp <= 0) { // player 1 wins
                                //reset player 2 winstreak
                                const resetWinStrk2 = await Players.update({ WINSTREAK: 0 }, { where: { USER_ID: player2.id } });
                                //player 1 stuff
                                const exp1 = expGain(typeAdvOne, p1lvl, p2lvl);
                                const geo1 = geoGain(p1lvl, p2lvl);
                                checkForLevelUp(p1lvl + 1, p1exp + exp1);
                                //victory embed
                                const victoryEmbed = new EmbedBuilder()
                                    .setTitle(`${player1.username} has won the battle against ${player2.username}!`)
                                    .setColor('Gold')
                                    .setThumbnail(player1.avatarURL())
                                    .setFooter({ text: `Total battle turns: ${turnsGoneBy}`, iconURL: 'https://cdn.discordapp.com/attachments/983502820248551504/1025976378308427796/pvoasdva.png' })
                                    .setDescription(`${player1.username} has gained \`${exp1}\` XP along with a reward of **${geo1}** geo!`)

                                message.channel.send({ embeds: [victoryEmbed] });

                                if (levelUp) {
                                    //db update, with level up
                                    statGain = statPointGain(p1lvl);
                                    message.channel.send(`<@${player1.id}> is now level **${p1lvl + 1}**, and has earned ${statGain} stat points!`);

                                    const updatep1 = await Players.update({
                                        EXP: p1exp + exp1,
                                        GEO: p1geo + geo1,
                                        STAT_PTS: p1statpoints + statGain,
                                        TOTAL_GEO: p1totalgeo + geo1
                                    }, { where: { USER_ID: player1.id } });

                                    player1db.increment('LVL');
                                } else {
                                    //db update, no level up
                                    const updatep1 = await Players.update({
                                        EXP: p1exp + exp1,
                                        GEO: p1geo + geo1,
                                        TOTAL_GEO: p1totalgeo + geo1
                                    }, { where: { USER_ID: player1.id } });
                                }
                                player1db.increment('BTLS_WON');
                                player1db.increment('WINSTREAK');
                            }
                        }
                    }
                });
            }
        }
    }
}
