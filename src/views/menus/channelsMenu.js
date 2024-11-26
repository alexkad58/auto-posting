const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('➕ Добавить канал', 'add_channel')],
  [Markup.button.callback('◀️ Назад', 'posting')],
]);
