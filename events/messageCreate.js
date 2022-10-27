const client = require('../index.js');
const { Collection } = require('discord.js');
const prefix = require('../config.json').prefix;
const fs = require('node:fs');
const path = require('node:path');
client.commands = new Collection();

const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

module.exports = {
    name: 'messageCreate',
    execute(message) {
        
        if (!message.content.toLowerCase().startsWith(prefix)) { 
            return; 
        }
        if (message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();
        if (!client.commands.has(commandName)) return;
        const command = client.commands.get(commandName);

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an issue executing that command.');
        }
        
    }
}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	//client.commands.set(command.name, command);
    command.name.forEach(name => client.commands.set(name, command));
}