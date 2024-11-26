const postingMenu = require('../../views/menus/postingMenu');
const createPostMenu = require('../../views/menus/createPostMenu');
const messages = require('../../views/messages');
const { updateAdministrators, generateChannelsMenu, generateChannelsSelect, generateCalendarChannelsMenu } = require('../../utils/main');
const editTextPostMenu = require('../../views/menus/editTextPostMenu');
const editMediaPostMenu = require('../../views/menus/editMediaPostMenu')
const editUrlPostMenu = require('../../views/menus/editUrlPostMenu')
const renderPost = require('../../utils/renderPost');
const sendPost = require('../../utils/sendPost');
const { Markup } = require('telegraf');
const renderSubmit = require('../../utils/renderSubmit');
const editReactionsPostMenu = require('../../views/menus/editReactionsPostMenu');
const editSecretPostMenu = require('../../views/menus/editSecretPostMenu');
const generateAndSendStatistics = require('../../utils/stats');

module.exports = (bot) => {
    bot.hears('📝 Постинг', (ctx) => {
        ctx.reply(messages.postingWelcome, postingMenu);
    });

    bot.hears('📊 Статистика', async (ctx) => {
        if (ctx.from.id != process.env.ADMIN_ID && ctx.from.id != require('../../../config/adminId')) return await ctx.reply('Недоступно.');
        try {
            await generateAndSendStatistics(ctx, bot.db, bot)
        } catch (error) {
            console.log(error)
            await ctx.reply(error.message);
        }
    });

    bot.action('posting', async (ctx) => {
        try {
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.postingWelcome, postingMenu);
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('create_post', async (ctx) => {
        try {
            await updateAdministrators(bot)
            if (!bot.cache.adminMap[ctx.from.id]) {
                const channelsMenu = await generateChannelsMenu(bot, ctx)
                await ctx.answerCbQuery(); 
                await ctx.deleteMessage(); 
                await ctx.reply(messages.myChannels, channelsMenu);
                return
            }
            if (bot.cache.savedMessages[ctx.from.id]) bot.cache.savedMessages[ctx.from.id] = {}
            bot.cache.status[ctx.from.id] = 'editing_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.createPost, createPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('edit_text_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_text_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.editTextPost, editTextPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('edit_media_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_media_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.editMediaPost, editMediaPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('edit_url_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_url_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.editUrlPost, editUrlPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('delete_url_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_post'
            bot.cache.waitMessageIds[ctx.from.id] = undefined
            bot.cache.savedMessages[ctx.from.id].messageData.urlKeyboard = undefined
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('edit_secret_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_secret_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.editSecretPost, editSecretPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('delete_secret_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_post'
            bot.cache.waitMessageIds[ctx.from.id] = undefined
            bot.cache.savedMessages[ctx.from.id].messageData.secret = {}
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('edit_reactions_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_reactions_post'
            
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.editReactionsPost, editReactionsPostMenu).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
            })
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });


    bot.action('delete_reactions_post', async (ctx) => {
        try {
            bot.cache.status[ctx.from.id] = 'editing_post'
            bot.cache.waitMessageIds[ctx.from.id] = undefined
            bot.cache.savedMessages[ctx.from.id].messageData.reactionsKeyboard = undefined
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('delete_text_post', async (ctx) => {
        try {
            if (bot.cache.savedMessages[ctx.from.id].type == 'text') {
                bot.cache.savedMessages[ctx.from.id] = {}
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                bot.cache.status[ctx.from.id] = 'none'
                await ctx.answerCbQuery();
                await ctx.deleteMessage();
                return 
            } else {
                bot.cache.savedMessages[ctx.from.id].messageData.caption = ''
            }
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('delete_media_post', async (ctx) => {
        try {
            if (bot.cache.savedMessages[ctx.from.id].type != 'text') {
                if (!bot.cache.savedMessages[ctx.from.id].messageData.caption || bot.cache.savedMessages[ctx.from.id].messageData.caption?.length < 1) {
                    bot.cache.savedMessages[ctx.from.id] = {}
                    bot.cache.waitMessageIds[ctx.from.id] = undefined
                    bot.cache.status[ctx.from.id] = 'none'
                    await ctx.answerCbQuery();
                    await ctx.deleteMessage();
                    return
                }
                if (bot.cache.savedMessages[ctx.from.id].messageData.caption_entities) bot.cache.savedMessages[ctx.from.id].messageData.entities = bot.cache.savedMessages[ctx.from.id].messageData.caption_entities
                bot.cache.savedMessages[ctx.from.id].messageData.text = bot.cache.savedMessages[ctx.from.id].messageData.caption
                bot.cache.savedMessages[ctx.from.id].messageData.caption = ''
                bot.cache.savedMessages[ctx.from.id].type = 'text'
            }
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('toogle_notification_post', async (ctx) => {
        try {
            if (bot.cache.savedMessages[ctx.from.id].messageData.disable_notification) {
                bot.cache.savedMessages[ctx.from.id].messageData.disable_notification = false
            } else {
                bot.cache.savedMessages[ctx.from.id].messageData.disable_notification = true
            }
            
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('toogle_spoiler_post', async (ctx) => {
        try {
            if (bot.cache.savedMessages[ctx.from.id].messageData.has_spoiler) {
                bot.cache.savedMessages[ctx.from.id].messageData.has_spoiler = false
            } else {
                bot.cache.savedMessages[ctx.from.id].messageData.has_spoiler = true
            }
            
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderPost(bot, ctx)
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('render_post', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage();

        try {
            renderPost(bot, ctx)
        } catch (error) {
            
        }
    })

    bot.action('select_channels_post', async (ctx) => {
        if (bot.cache.savedMessages[ctx.from.id].news) {
            bot.cache.savedMessages[ctx.from.id].channels = ['news']
            await ctx.answerCbQuery();
            await ctx.deleteMessage();
            await renderSubmit(bot, ctx)
            return
        }
        await ctx.answerCbQuery();
        await ctx.deleteMessage();
        const selectChannelsMenu = await generateChannelsSelect(bot, ctx)
        let channelsString = ''

        if (bot.cache.savedMessages[ctx.from.id].channels) {
            for (const channelId of bot.cache.savedMessages[ctx.from.id].channels) {
                try {
                    const channelData = await bot.db.getData(`/channels/${channelId}`)
                    if (!channelData) continue;
                    channelsString += ('\n' + channelData.title)
                } catch (error) {
                    
                }
            }
        }
        
        try {
            await ctx.reply(messages.selectChannels + channelsString, selectChannelsMenu)
        } catch (error) {
            console.log(error)
        }
    })

    bot.action('submit_posting', async (ctx) => {
        await ctx.answerCbQuery();
        if (!bot.cache.savedMessages[ctx.from.id]?.channels) return
        if (!bot.cache.savedMessages[ctx.from.id]?.channels[0]) return
        await ctx.deleteMessage();

        await renderSubmit(bot, ctx)
    })

    bot.action('send_post', async (ctx) => {
        await ctx.answerCbQuery();
        if (!bot.cache.savedMessages[ctx.from.id]?.channels) return
        if (!bot.cache.savedMessages[ctx.from.id]?.channels[0]) return
        await ctx.deleteMessage();
        try {
            if (bot.cache.savedMessages[ctx.from.id].channels[0] == 'news') {
                bot.cache.savedMessages[ctx.from.id].channels = await bot.db.getData('/users')
                bot.cache.savedMessages[ctx.from.id].news = true
            }
            if (!bot.cache.savedMessages[ctx.from.id].time) {
                await sendPost(bot, bot.cache.savedMessages[ctx.from.id])
            } else {
                await bot.db.push('/posts[]', bot.cache.savedMessages[ctx.from.id])
            }
            
            const userCache = bot.cache.savedMessages[ctx.from.id];
            const sendTimer = `\n\nПост будет отправлен: ${userCache.time || 'сейчас'}`;
            const deleteTimer = `\n\nПост будет удален: ${userCache.deleteTime || 'никогда'}`;

            await ctx.reply(messages.postSended + sendTimer + deleteTimer)
        } catch (error) {
            console.log(error)
        }
    })

    bot.action('post_timer', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage();
        try {
            bot.cache.status[ctx.from.id] = 'setting_timer'
            await ctx.reply(messages.settingTimer, Markup.inlineKeyboard([
                [Markup.button.callback('◀️ Назад', 'submit_posting')]
              ])).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
              })
        } catch (error) {
            console.log(error)
        }
    })

    bot.action('autodelete_post', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.deleteMessage();
        try {
            bot.cache.status[ctx.from.id] = 'setting_autodelete'
            await ctx.reply(messages.settingAutodelete, Markup.inlineKeyboard([
                [Markup.button.callback('◀️ Назад', 'submit_posting')]
              ])).then(m => {
                bot.cache.waitMessageIds[ctx.from.id] = m.message_id
              })
        } catch (error) {
            console.log(error)
        }
    })

    bot.action('my_channels', async (ctx) => {
        try {
            await updateAdministrators(bot)
            const channelsMenu = await generateChannelsMenu(bot, ctx)
            await ctx.answerCbQuery(); 
            await ctx.deleteMessage(); 
            await ctx.reply(messages.myChannels, channelsMenu);
        } catch (err) {
            console.error('Ошибка при удалении сообщения:', err);
        }
    });

    bot.action('view_calendar', async (ctx) => {
        await updateAdministrators(bot)
        const calendarChannelsMenu = await generateCalendarChannelsMenu(bot, ctx)
        await ctx.answerCbQuery(); 
        await ctx.deleteMessage(); 
        ctx.reply(messages.calendar, calendarChannelsMenu);
    });
};