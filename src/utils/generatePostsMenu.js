const { Markup } = require("telegraf")

module.exports = generatePostsMenu = async (bot, posts) => {
    const keyboard = []
    posts.forEach(post => {
        let label = post.messageData.text || post.messageData.caption || '📺'
        keyboard.push([Markup.button.callback(`⏳[${post.time}] - ${label.substring(0,15) + '...'}`, `edit_post_${post.id}`)])
    });
    keyboard.push([Markup.button.callback('◀️ Назад', 'view_calendar')])
    return Markup.inlineKeyboard(keyboard)
}