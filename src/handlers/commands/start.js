const mainMenu = require('../../views/menus/mainMenu');
const messages = require('../../views/messages');

module.exports = (bot) => {
    bot.start((ctx) => {
      ctx.reply(messages.welcome, mainMenu);
    });
};