const { Markup } = require('telegraf');

const url = 'https://t.me/NoatinPosting_bot?startchannel&admin=change_info+post_messages+edit_messages+delete_messages+promote_members+invite_users'

module.exports = Markup.inlineKeyboard([
  [Markup.button.url('➕ Добавить канал', url)],
  [Markup.button.callback('◀️ Назад', 'my_channels')],
]);
