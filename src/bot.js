require('dotenv').config()
const { Config, JsonDB } = require('node-json-db')
const { Telegraf } = require('telegraf')

const db = new JsonDB(new Config('database', true, true, '/'));

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.db = db
bot.cache = {}
bot.cache.status = {}
bot.cache.waitMessageIds = {}
bot.cache.savedMessages = {}

// Регистрация команд
require('./handlers/commands/start')(bot);

// Регистрация действий
require('./handlers/actions/posting')(bot);
require('./handlers/actions/my_channels')(bot);
require('./utils/handleChannelsStatus')(bot);

require('./handlers/actions/my_channels')(bot);
require('./handlers/actions/editing_post')(bot);
require('./utils/postCycle')(bot);

bot.telegram.setMyCommands([
    { command: '/start', description: 'Запустить бота' }
  ]);

bot.launch().then(() => {
  require('./utils/main').updateAdministrators(bot);
})    

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));