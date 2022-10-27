const Sequelize = require('sequelize');

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Players = sequelize.define('players', {
    HM_ID: Sequelize.TINYINT,
    USER_ID: Sequelize.STRING,
    USERNAME: Sequelize.STRING,
    TYPE: Sequelize.STRING,
    LVL: Sequelize.TINYINT,
    EXP: Sequelize.SMALLINT,
    GEO: Sequelize.SMALLINT,
    MOVE_ONE: Sequelize.JSONB,
    MOVE_TWO: Sequelize.JSONB,
    MOVE_THREE: Sequelize.JSONB,
    HP: Sequelize.TINYINT,
    ATK: Sequelize.TINYINT,
    DEF: Sequelize.TINYINT,
    SPD: Sequelize.TINYINT,
    ITEMS: [],
    STAT_PTS: Sequelize.SMALLINT,
    BTLS_WON: Sequelize.SMALLINT,
    FAV_MOVE: Sequelize.STRING,
    TOTAL_GEO: Sequelize.SMALLINT,
    WINSTREAK: Sequelize.TINYINT,
    MOVES_USED: Sequelize.SMALLINT,
    SELECTED: Sequelize.BOOLEAN
});

const hmIdIterator = sequelize.define('hmIdIterator', {
    tru: Sequelize.BOOLEAN,
    count: Sequelize.TINYINT
});

const ticNumber = sequelize.define('ticNumber', {
    tru: Sequelize.BOOLEAN,
    number: Sequelize.SMALLINT
});

//name, description, category, power, acc, pp, priority, status {effect type, eff chance, target, duration (in turns), amount (If acc/atk/def/spd)}, 

//CFHPPS: 'Confusion', 'Flinch', 'Heal', 'Paralyze', 'Poison', 'Sleep'
//AADS: 'ATK', 'DEF', 'SPD', 'ACC'

//type, chance, target, duration, amount

const movesList = {
    'Cursed': {
        "I'd Smash": {
            name: "I'd Smash",
            description: "The user tells their opponent they'd smash, inflicting psychic damage.",
            type: 'Cursed',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "STFU": {
            name: "STFU",
            description: "The user tells their opponent to STFU, upsetting them and lowering their `Accuracy` by 15 for 3 turns.",
            type: 'Cursed',
            category: 'status',
            accuracy: 100,
            pp: 40,
            effectType: 'ACC',
            effectTarget: 2,
            effectDur: 3,
            effectAmt: -15,
            priority: false
        },
        "Toxicity": {
            name: "Toxicity",
            description: "The user displays a toxic attitude toward the target, inflicting `Poison` for the rest of the fight.",
            type: 'Cursed',
            category: 'status',
            accuracy: 90,
            pp: 15,
            effectType: 'Poison',
            effectTarget: 2,
            effectDur: 200,
            priority: false
        },
        "Pet Stir Fry": {
            name: "Pet Stir Fry",
            description: "The user stir fries the opponent's pet, causing emotional damage. Has 30% chance of causing `Paralysis` from the horror.",
            type: 'Cursed',
            category: 'attack',
            power: 50,
            accuracy: 90,
            pp: 15,
            effectType: 'Paralyze',
            effectChance: .30,
            effectTarget: 2,
            effectDur: randomRange(2, 6),
            priority: false
        },
        "Mean Jab": {
            name: "Mean Jab",
            description: "The user says something particularly mean to the opponent. Has 30% chance of `Poison`ing the opponent.",
            type: 'Cursed',
            category: 'attack',
            power: 50,
            accuracy: 90,
            pp: 15,
            effectType: 'Poison',
            effectChance: .30,
            effectTarget: 2,
            effectDur: randomRange(2, 6),
            priority: false
        },
        "Vore": {
            name: "Vore",
            description: "The user vores the opponent and `Heal`s for half of the damage dealt.",
            type: 'Cursed',
            category: 'attack',
            power: 30,
            accuracy: 100,
            pp: 25,
            effectType: 'Heal',
            effectTarget: 1,
            priority: false
        }
    },
    'Pure': {
        "Minimod Bonk": {
            name: "Minimod Bonk",
            description: "The user scoffs at and bonks their opponent on the head.",
            type: 'Pure',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "Positive Attitude": {
            name: "Positive Attitude",
            description: "The user smiles in the face of danger, increasing their `DEF` by 20 for 3 turns.",
            type: 'Pure',
            category: 'status',
            accuracy: 100,
            pp: 40,
            effectType: 'DEF',
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 20,
            priority: false
        },
        "Righteous Strike": {
            name: "Righteous Strike",
            description: "The user channels their righteous energy to strike their enemy down.",
            type: 'Pure',
            category: 'attack',
            power: 65,
            accuracy: 100,
            pp: 25,
            priority: false
        },
        "Debate Trap": {
            name: "Debate Trap",
            description: "The user traps their opponent in a debate. Deals damage every turn for 2-5 turns.",
            type: 'Pure',
            category: 'attack',
            power: 30,
            accuracy: 90,
            pp: 15,
            priority: false
        },
        "Cancellation": {
            name: "Cancellation",
            description: "The user cancels the opponent. Has a 20% chance of causing the opponent to `Flinch`.",
            type: 'Pure',
            category: 'attack',
            power: 70,
            accuracy: 100,
            pp: 10,
            effectType: 'Flinch',
            effectTarget: 2,
            priority: false
        },
        "Callout": {
            name: "Callout",
            description: "The user calls out the opponent out on something they did. This move cannot miss.",
            type: 'Pure',
            category: 'attack',
            power: 70,
            accuracy: 9999,
            pp: 10,
            priority: false
        },
        "Kitty Post": {
            name: "Kitty Post",
            description: "The user posts a kitty picture, causing their opponent to die of cuteness, lowering their `ATK` by 20 for 3 turns.",
            type: 'Pure',
            category: 'attack',
            power: 60,
            accuracy: 90,
            pp: 15,
            effectType: 'ATK',
            effectTarget: 2,
            effectDur: 3,
            effectAmt: -20,
            priority: false
        }
    },
    'Savvy': {
        "Newton's Law": {
            name: "Newton's Law",
            description: "The user demonstrates F=MA by throwing an apple at their opponent.",
            type: 'Savvy',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "HT Kill": {
            name: "HT Kill",
            description: "The user uses Intercom's \"ht kill\" command on the target. Has a 15% chance of causing the target to `Flinch`.",
            type: 'Savvy',
            category: 'attack',
            power: 60,
            accuracy: 100,
            pp: 25,
            effectType: 'Flinch',
            effectChance: .15,
            effectTarget: 2,
            priority: false
        },
        "Perms Switch": {
            name: "Perms Switch",
            description: "The user switches their `ATK` with their opponent.",
            type: 'Savvy',
            category: 'status',
            accuracy: 100,
            pp: 20,
            priority: false
        },
        "Boring Lecture": {
            name: "Boring Lecture",
            description: "The user bores their opponent, causing them to fall asleep.",
            type: 'Savvy',
            category: 'status',
            accuracy: 90,
            pp: 15,
            effectType: 'Sleep',
            effectTarget: 2,
            effectDur: randomRange(2, 6),
            priority: false
        },
        "Quiz": {
            name: "Quiz",
            description: "The user asks their opponent questions. Hits 2-5 times. Each hit has a 10% chance of raising the user's `ATK` by 10 for 3 turns.",
            type: 'Savvy',
            category: 'attack',
            power: 15,
            accuracy: 85,
            pp: 15,
            effectType: 'ATK',
            effectChance: .10,
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 10,
            priority: false
        }
    },
    'Foolish': {
        "Spam": {
            name: "Spam",
            description: "The user hits for one point of damage 40 times in a row.",
            type: 'Foolish',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "Alt Account": {
            name: "Alt Account",
            description: "The user spends 25% of their maximum HP and creates and alternate account that will soak up damage.",
            type: 'Foolish',
            category: 'attack',
            accuracy: 100,
            pp: 10,
            effectType: 'DEF',
            effectTarget: 1,
            effectDur: 200,
            effectAmt: 30,
            priority: false
        },
        "Me When Beans": {
            name: "Me When Beans",
            description: "The user posts an annoying gif, inflicting damage.",
            type: 'Foolish',
            category: 'attack',
            power: 60,
            accuracy: 100,
            pp: 20,
            priority: false
        },
        "Ctrl+C/Ctrl+V": {
            name: "Ctrl+C/Ctrl+V",
            description: "The user arms themself with a keyboard shortcut, increasing their `SPD` by 30 for 3 turns.",
            type: 'Foolish',
            category: 'status',
            accuracy: 100,
            pp: 40,
            effectType: 'SPD',
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 30,
            priority: false
        },
        "Flash Post": {
            name: "Flash Post",
            description: "The user posts something and quickly deletes it before the opponent can screenshot it. This move always goes first.",
            type: 'Foolish',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 30,
            priority: true
        },
        "No U": {
            name: "No U",
            description: "The user throws a \"No U\" insult at the opponent, discouraging them and lowering their `SPD` by 20 for 3 turns.",
            type: 'Foolish',
            category: 'attack',
            power: 60,
            accuracy: 90,
            pp: 15,
            effectType: 'SPD',
            effectTarget: 2,
            effectDur: 3,
            effectAmt: -20,
            priority: false
        }
    },
    'Creative': {
        "Papercut": {
            name: "Papercut",
            description: "The user cuts their opponent with a piece of paper.",
            type: 'Creative',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "Where It Hurts": {
            name: "Where It Hurts",
            description: "The user draws an accurate caricature of the opponent. This move cannot miss.",
            type: 'Creative',
            category: 'attack',
            power: 50,
            accuracy: 999,
            pp: 20,
            priority: false
        },
        "Practice Sketch": {
            name: "Practice Sketch",
            description: "The user makes a quick practice sketch, increasing their `ATK` and `ACC` by 10 each for 3 turns.",
            type: 'Creative',
            category: 'status',
            accuracy: 100,
            pp: 40,
            effectType: ['ATK', 'ACC'],
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 10,
            priority: false
        },
        "Canvas Barrier": {
            name: "Canvas Barrier",
            description: "The user shields themself with a canvas, increasing their `DEF` by 30 for 3 turns.",
            type: 'Creative',
            category: 'status',
            accuracy: 100,
            pp: 40,
            effectType: 'DEF',
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 30,
            priority: false
        },
        "Soothing Art Session": {
            name: "Soothing Art Session",
            description: "The user takes their time to relax, `Heal`ing 50% of their maximum HP.",
            type: 'Creative',
            category: 'status',
            accuracy: 100,
            pp: 10,
            effectType: 'Heal',
            effectTarget: 1,
            priority: false
        }
    },
    'Gay': {
        "Rainbow Stamp": {
            name: "Rainbow Stamp",
            description: "The user stamps a rainbow on their opponent's forehead.",
            type: 'Gay',
            category: 'attack',
            power: 40,
            accuracy: 100,
            pp: 35,
            priority: false
        },
        "Ship Haze": {
            name: "Ship Haze",
            description: "The user hypes themself up with thoughts of their OTP, increasing their `ATK` by 20 for 3 turns.",
            type: 'Gay',
            category: 'status',
            accuracy: 100,
            pp: 20,
            effectType: 'ATK',
            effectTarget: 1,
            effectDur: 3,
            effectAmt: 20,
            priority: false
        },
        "Ze'mer's Gay Nail": {
            name: "Ze'mer's Gay Nail",
            description: "The user strikes their enemy with Ze'mer's giant ass nail, and receives recoil damage equal to 1/4 of the damage dealt.",
            type: 'Gay',
            category: 'attack',
            power: 120,
            accuracy: 100,
            pp: 15,
            priority: false
        },
        "Trans Your Gender": {
            name: "Trans Your Gender",
            description: "The user casts trans your gender on the opponent. Has a 20% chance of causing `Confusion`.",
            type: 'Gay',
            category: 'attack',
            power: 80,
            accuracy: 90,
            pp: 15,
            effectType: 'Confusion',
            effectTarget: 2,
            effectDur: randomRange(2, 6),
            priority: false
        },
        "Flag Whack": {
            name: "Flag Whack",
            description: "The user swings their pride flag at the opponent, causing substantial damage.",
            type: 'Gay',
            category: 'attack',
            power: 110,
            accuracy: 80,
            pp: 5,
            priority: false
        },
        "I Ship It": {
            name: "I Ship It",
            description: "The user convinces the opponent to ship their OTP. If this move misses, the user loses half of their maximum HP.",
            type: 'Gay',
            category: 'attack',
            power: 130,
            accuracy: 80,
            pp: 10,
            priority: false
        }
    },
    none: {
        name: "No move assigned"
    }
}

module.exports.Players = Players;
module.exports.movesList = movesList;
module.exports.hmIdIterator = hmIdIterator;
module.exports.ticNumber = ticNumber;

/*

https://discordjs.guide/sequelize/#creating-the-model
https://discordjs.guide/sequelize/#syncing-the-model
https://discordjs.guide/sequelize/#adding-a-tag

https://discordjs.guide/sequelize/#fetching-a-tag
https://discordjs.guide/sequelize/#editing-a-tag
https://discordjs.guide/sequelize/#display-info-on-a-specific-tag
https://discordjs.guide/sequelize/#listing-all-tags
https://discordjs.guide/sequelize/#deleting-a-tag

*/
