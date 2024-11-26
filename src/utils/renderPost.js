const { Markup } = require('telegraf');
const mergeKeyboards = require('./mergeKeyBoards');
const generateKeyboardWithRandomId = require('./generateSecret');

module.exports = async (bot, ctx) => {
    try {
        await ctx.deleteMessage()
 
    } catch (error) {

    }
  const userId = ctx.from.id;
  const userCache = bot.cache.savedMessages[userId];
  bot.cache.status[userId] = undefined
  if (!userCache || !userCache.messageData) return;
  const { messageData, type } = userCache;
  const notification = messageData.disable_notification ? '🔕' : '🔔'
  const spoiler = messageData.has_spoiler ? '🫥' : '😐'

  let editPostMenu = Markup.inlineKeyboard([
    [Markup.button.callback('✏️ Изменить текст', 'edit_text_post')],
    [Markup.button.callback('📺 Изменить медиа', 'edit_media_post')],
    [Markup.button.callback('🔗 URL кнопки', 'edit_url_post')],
    [Markup.button.callback('👍 Реакции', 'edit_reactions_post')],
    [Markup.button.callback('🔐 Скрытое продолжение', 'edit_secret_post')],
    [Markup.button.callback(`${spoiler} Спойлер`, 'toogle_spoiler_post')],
    [Markup.button.callback(`${notification} Уведомление`, 'toogle_notification_post')],
    [Markup.button.callback(`${userCache.isEdit ? '🗑️ Удалить пост' : '◀️ Назад'}`, `${userCache.isEdit ? 'view_calendar' : 'create_post'}`), Markup.button.callback('Далее ▶️', 'select_channels_post')],
  ]);

  if (userCache.messageData.urlKeyboard) editPostMenu = mergeKeyboards(userCache.messageData.urlKeyboard, editPostMenu)
  if (userCache.messageData.reactionsKeyboard) editPostMenu = mergeKeyboards(userCache.messageData.reactionsKeyboard, editPostMenu)
  if (userCache.messageData.secret?.title && userCache.messageData.secret?.noshow && userCache.messageData.secret?.show) {
    const secretKeyboard = await generateKeyboardWithRandomId(bot, userCache.messageData.secret)
    editPostMenu = mergeKeyboards(secretKeyboard, editPostMenu)
  }
  
  const sendMessage = async (type, data) => {
    const options = {
      link_preview_options: messageData.link_preview_options || {},
      caption_entities: messageData.caption_entities || [],
      entities: messageData.entities || [],
      has_spoiler: messageData.has_spoiler,
      disable_notification: messageData.disable_notification,
      caption: messageData.caption,
      ...editPostMenu,
    };
    console.log(options.link_preview_options)
    console.log(options.entities, messageData.entities)
    switch (type) {
      case 'text':
        await ctx.reply(data.text, options);
        break;
      case 'photo':
        await ctx.telegram.sendPhoto(userId, data.photo[data.photo.length - 1].file_id, options);
        break;
      case 'video':
        await ctx.telegram.sendVideo(userId, data.video.file_id, options);
        break;
      default:
        console.error('Неизвестный тип сообщения:', type);
    }
  };
  await sendMessage(type, messageData);
};