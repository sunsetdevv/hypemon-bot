const { Players, hmIdIterator, ticNumber } = require('../database/database.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		Players.sync({/* force: true */});
		hmIdIterator.sync({ force: true });
		ticNumber.sync({ force: true });
		console.log(`Ready! Logged in as ${client.user.tag}`);
	}
};