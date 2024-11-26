const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('🗑️ Удалить кнопки', 'delete_url_post')],
  [Markup.button.callback('◀️ Назад', 'render_post')]
]);
