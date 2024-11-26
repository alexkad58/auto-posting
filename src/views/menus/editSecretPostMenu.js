const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('🗑️ Удалить скрытое продолжение', 'delete_secret_post')],
  [Markup.button.callback('◀️ Назад', 'render_post')]
]);
