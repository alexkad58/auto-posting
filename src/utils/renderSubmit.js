const messages = require('../views/messages');
const submitPostMenu = require('../views/menus/submitPostMenu');

module.exports = async (bot, ctx) => {
    bot.cache.status[ctx.from.id] = 'editing_post'
    try {
        const userCache = bot.cache.savedMessages[ctx.from.id];
        const sendTimer = `\n\nОтложен: ${userCache.time || 'нет'}`;
        const deleteTimer = `\n\nАвтоудаление: ${userCache.deleteTime || 'нет'}`;

        await ctx.reply(messages.submitPost + sendTimer + deleteTimer, submitPostMenu);
    } catch (error) {
        console.log(error)
    }
}