const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
    [Markup.button.callback('📩 Опубликовать пост', 'send_post')],
    [Markup.button.callback('⏳ Отложить пост', 'post_timer'), Markup.button.callback('⌛ Автоудаление', 'autodelete_post')],
    [Markup.button.callback('◀️ Назад', 'select_channels_post')],
]);
