const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
    [Markup.button.callback('🗑️ Удалить медиа', 'delete_media_post')],
    [Markup.button.callback('◀️ Назад', 'render_post')]
]);
