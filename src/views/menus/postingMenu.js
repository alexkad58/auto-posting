const { Markup } = require('telegraf');

module.exports = Markup.inlineKeyboard([
  [Markup.button.callback('➕ Создать пост', 'create_post'), Markup.button.callback('📃 Мои каналы', 'my_channels')],
  [Markup.button.callback('📅 Календарь постов', 'view_calendar')],
]);
