const messages = require('../../views/messages');
const { Markup } = require('telegraf')
const addChannelMenu = require('../../views/menus/addChannelMenu')
const { generateChannelsMenu, updateAdministrators, generateChannelsSelect } = require('../../utils/main');
const updateReactionButtonText = require('../../utils/updateReactionButtonText');
const isUserSubscriber = require('../../utils/isUserSubscriber');
const generatePostsMenu = require('../../utils/generatePostsMenu');
const renderPost = require('../../utils/renderPost');
const renderSubmit = require('../../utils/renderSubmit');

module.exports = (bot) => {
  bot.action('add_channel', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.deleteMessage();
      await ctx.reply(messages.myChannels, addChannelMenu);
    } catch (err) {
        console.error('Ошибка при удалении сообщения:', err);
    }
  });

  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('manage_channel_')) {
        const channelId = data.replace('manage_channel_', '');
        const channelData = await bot.db.getData(`/channels/${channelId}`)

        const manageChannelMenu = Markup.inlineKeyboard([
          [Markup.button.callback('🗑️ Удалить канал', `delete_channel_${channelId}`)],
          [Markup.button.callback('🔙', 'my_channels')],
        ]);

        await ctx.answerCbQuery(); 
        await ctx.deleteMessage();
        await ctx.reply(messages.manageChannel.replace('<channelName>', channelData.title), manageChannelMenu);
    }

    if (data.startsWith('delete_channel_')) {
      const channelId = data.replace('delete_channel_', '');
      await bot.telegram.leaveChat(channelId)
      await bot.db.delete(`channels/${channelId}`)

      await updateAdministrators(bot)
      const channelsMenu = await generateChannelsMenu(bot, ctx)

      await ctx.answerCbQuery(); 
      await ctx.deleteMessage();
      await ctx.reply(messages.myChannels, channelsMenu);
    }

    if (data.startsWith('select_channel_')) {
      const fromId = ctx.from.id
      const channelId = data.replace('select_channel_', '');
      if (!bot.cache.savedMessages[fromId].channels) bot.cache.savedMessages[fromId].channels = []

      const channels = bot.cache.savedMessages[fromId].channels
      const index = channels.indexOf(channelId)

      if (index !== -1) {
        channels.splice(index, 1)
      } else {
        channels.push(channelId)
      }

      let selectedChannelsString = messages.selectChannels
      try {
        for (const channelId of channels) {
            const channelData = await bot.db.getData(`/channels/${channelId}`)
            if (!channelData) continue;
            selectedChannelsString += ('\n' + channelData.title)
        }
      } catch (error) {
        console.log(error)
      }
      const selectChannelsMenu = await generateChannelsSelect(bot, ctx)

      await ctx.answerCbQuery(); 
      await ctx.deleteMessage();
      await ctx.reply(selectedChannelsString, selectChannelsMenu);
    }

    if (data.startsWith('select_news')) {
      await ctx.answerCbQuery();
      bot.cache.savedMessages[ctx.from.id].channels = []
      bot.cache.savedMessages[ctx.from.id].channels.push('news')

      await ctx.deleteMessage();

      await renderSubmit(bot, ctx)
    }

    if (data.startsWith('reaction_')) {
      const existingKeyboard = ctx.update.callback_query.message.reply_markup.inline_keyboard;
      const updatedKeyboard = await Promise.all(
        existingKeyboard.map(async (row) =>
          Promise.all(
            row.map(async (button) => {
              if (button.callback_data === data) {
                const text = await updateReactionButtonText(button.text, ctx, bot);
                button.text = text;
              }
              return button;
            })
          )
        )
      );
      try {
        await ctx.editMessageReplyMarkup({ inline_keyboard: updatedKeyboard });
      } catch (error) {
        console.log(error.message)
      }
    }

    if (data.startsWith('secret_data_')) {
      const secretId = data.replace('secret_data_', '');
      try {
        const secret = await bot.db.getData(`/secrets/${secretId}`)
        if (!secret) return ctx.answerCbQuery(`Ошбика`);
        const chatId = ctx.chat?.id || ctx.callbackQuery.message.chat.id;
        const userId = ctx.from.id;

        const isUser = await isUserSubscriber(bot, userId, chatId)

        if (isUser) {
          ctx.answerCbQuery(secret.show, { show_alert: true });
        } else {
          ctx.answerCbQuery(secret.noshow, { show_alert: true });
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (data.startsWith('calendar_channel_')) {
      const channelId = data.replace('calendar_channel_', '');
      try {
        const resultPosts = []
        const allPosts = await bot.db.getData('/posts')

        if (!allPosts[0]) return await ctx.answerCbQuery('Нет запланированных постов.'); 
        allPosts.forEach(post => {
          if (post.news && channelId == 'news') {
            return resultPosts.push(post)
          }
          post.channels.forEach(id => {
            if (id == channelId) return resultPosts.push(post)
          })
        });
        if (!resultPosts[0]) return await ctx.answerCbQuery('Нет запланированных постов.');
        const postsMenu = await generatePostsMenu(bot, resultPosts)
        await ctx.answerCbQuery(); 
        await ctx.deleteMessage();
        await ctx.reply(messages.calendarPosts, postsMenu)
      } catch (error) {
        console.log(error)
      }
    }

    if (data.startsWith('edit_post_')) {
      const postId = data.replace('edit_post_', '');
      try {
        const resultPosts = []
        const allPosts = await bot.db.getData('/posts')
        const postsToPush = []

        allPosts.forEach((post, i) => {
          if (post.id == postId) {
            resultPosts.push(post)
          } else {
            postsToPush.push(post)
          }
        });
        await bot.db.push('/posts', postsToPush)

        if (!resultPosts[0]) return await ctx.answerCbQuery('Ошибка.'); 

        bot.cache.savedMessages[ctx.from.id] = resultPosts[0]
        bot.cache.savedMessages[ctx.from.id].isEdit = true
        await ctx.answerCbQuery(); 
        await ctx.deleteMessage();
        renderPost(bot, ctx)
      } catch (error) {
        console.log(error)
      }
    }
  });
};