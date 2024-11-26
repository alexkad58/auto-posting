const { Markup } = require('telegraf');
const mergeKeyboards = require('./mergeKeyBoards');
const generateKeyboardWithRandomId = require('./generateSecret');

module.exports = async (bot, post) => {
    const { type, channels, messageData } = post
    let message_id = ''
    for (const channelId of channels) {
        try {

            let editPostMenu = Markup.inlineKeyboard([]);
          
            if (messageData.urlKeyboard) editPostMenu = mergeKeyboards(messageData.urlKeyboard, editPostMenu)
            if (messageData.reactionsKeyboard) editPostMenu = mergeKeyboards(messageData.reactionsKeyboard, editPostMenu)
            if (messageData.secret?.title && messageData.secret?.noshow && messageData.secret?.show) {
              const secretKeyboard = await generateKeyboardWithRandomId(bot, messageData.secret)
              editPostMenu = mergeKeyboards(secretKeyboard, editPostMenu)
            }
            // console.log(editPostMenu)
            const options = {
                link_preview_options: messageData.link_preview_options || {},
                caption_entities: messageData.caption_entities || [],
                entities: messageData.entities || [],
                has_spoiler: messageData.has_spoiler,
                disable_notification: messageData.disable_notification,
                caption: messageData.caption || '',
                disable_notification: messageData.disable_notification || false,
                ...editPostMenu
              };
              console.log(options.link_preview_options)
            switch (type) {
                case 'text':
                  await bot.telegram.sendMessage(channelId, messageData.text, options).then(m => message_id = m.message_id);
                  break;
                case 'photo':
                  await bot.telegram.sendPhoto(channelId, messageData.photo[messageData.photo.length - 1].file_id, options).then(m => message_id = m.message_id);
                  break;
                case 'video':
                  await bot.telegram.sendVideo(channelId, messageData.video.file_id, options).then(m => message_id = m.message_id);
                  break;
                default:
                  console.error('Неизвестный тип сообщения:', type);
              }
        } catch (error) {
            console.log(error)
        }

        if (post.deleteTime) {
            post.message_id = message_id
            await bot.db.push('/posts[]', post)
        }
    }
}