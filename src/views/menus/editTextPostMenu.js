const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('🗑️ Удалить текст', 'delete_text_post')],
  [Markup.button.callback('◀️ Назад', 'render_post')]
]);
