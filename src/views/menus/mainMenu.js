const { Markup } = require('telegraf');

module.exports = Markup.keyboard([
  ['📝 Постинг', '📊 Статистика'], 
])
  .resize() 
  .oneTime(false)
  .persistent(false);