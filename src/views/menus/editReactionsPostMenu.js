const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('🗑️ Удалить реакции', 'delete_reactions_post')],
  [Markup.button.callback('◀️ Назад', 'render_post')]
]);
