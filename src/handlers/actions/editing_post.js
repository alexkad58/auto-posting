const { Markup } = require("telegraf");
const generateReactionButtonsFromText = require("../../utils/fenerateReactions");
const generateUrls = require("../../utils/generateUrls");
const { checkDate } = require("../../utils/main");
const renderPost = require("../../utils/renderPost");
const renderSubmit = require("../../utils/renderSubmit");
const messages = require("../../views/messages");

module.exports = async (bot) => {
    bot.on('message', async ctx => {
        try {
            const userId = ctx.from.id
            if (userId) {
                const users = await bot.db.getData("/users") || [];
                if (!users.includes(userId)) {
                    users.push(userId);
                    bot.db.push("/users", users, true);
                }
            }
        } catch (err) {
            console.log(err)
        }
        const message = ctx.message
        console.log(message)
        if (bot.cache.status[ctx.from.id] == 'editing_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (message.text) {
                savedMessage = message;
                try {
                    const messageId = bot.cache.waitMessageIds[ctx.from.id]
                    bot.cache.waitMessageIds[ctx.from.id] = undefined
                    await bot.telegram.deleteMessage(ctx.from.id, messageId)
                    
                    bot.cache.savedMessages[ctx.from.id] = {
                        messageData: {
                            text: savedMessage.text
                        },
                        type: 'text'
                    }

                } catch (error) {
                    
                }
            }

            if (message.photo) {
                savedMessage = message;
                try {
                    const messageId = bot.cache.waitMessageIds[ctx.from.id]
                    bot.cache.waitMessageIds[ctx.from.id] = undefined
                    await bot.telegram.deleteMessage(ctx.from.id, messageId)
                    
                    bot.cache.savedMessages[ctx.from.id] = {
                        messageData: {
                            photo: savedMessage.photo,
                            caption: savedMessage.caption || ''
                        },
                        type: 'photo'
                    }

                } catch (error) {
                    
                }
            }

            if (message.document?.mime_type == 'video/mp4' || message.video) {
                savedMessage = message;
                try {
                    const messageId = bot.cache.waitMessageIds[ctx.from.id]
                    bot.cache.waitMessageIds[ctx.from.id] = undefined
                    await bot.telegram.deleteMessage(ctx.from.id, messageId)
                    
                    bot.cache.savedMessages[ctx.from.id] = {
                        messageData: {
                            video: savedMessage.document || savedMessage.video,
                            caption: savedMessage.caption || ''
                        },
                        type: 'video'
                    }
                    
                } catch (error) {
                    
                }
            }
            bot.cache.savedMessages[ctx.from.id].messageData.disable_notification = false
            bot.cache.savedMessages[ctx.from.id].messageData.has_spoiler = false
            bot.cache.savedMessages[ctx.from.id].id = Math.random().toString(36).substring(2, 10);
            if (message.link_preview_options) bot.cache.savedMessages[ctx.from.id].messageData.link_preview_options = message.link_preview_options
            if (message.caption_entities) bot.cache.savedMessages[ctx.from.id].messageData.caption_entities = message.caption_entities
            if (message.entities) bot.cache.savedMessages[ctx.from.id].messageData.entities = message.entities
            renderPost(bot, ctx)
        }

        if (bot.cache.status[ctx.from.id] == 'editing_text_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return

            try {
                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                if (bot.cache.savedMessages[ctx.from.id].type == 'text') {
                    bot.cache.savedMessages[ctx.from.id].messageData.text = message.text
                    if (message.entities) bot.cache.savedMessages[ctx.from.id].messageData.entities = message.entities
                    if (message.link_preview_options) bot.cache.savedMessages[ctx.from.id].messageData.link_preview_options = message.link_preview_options
                } else {
                    bot.cache.savedMessages[ctx.from.id].messageData.caption = message.text
                    if (message.caption_entities) bot.cache.savedMessages[ctx.from.id].messageData.entities = message.caption_entities
                    if (message.link_preview_options) bot.cache.savedMessages[ctx.from.id].messageData.link_preview_options = message.link_preview_options
                }
                renderPost(bot, ctx)
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'editing_url_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return 
            const urlKeyboard = generateUrls(message.text)
            if (urlKeyboard) bot.cache.savedMessages[ctx.from.id].messageData.urlKeyboard = urlKeyboard
            try {
                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                renderPost(bot, ctx)
            } catch (error) {
                
            }
        }
        
        if (bot.cache.status[ctx.from.id] == 'editing_reactions_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return 
            const reactionsKeyboard = generateReactionButtonsFromText(message.text)
            if (reactionsKeyboard) bot.cache.savedMessages[ctx.from.id].messageData.reactionsKeyboard = reactionsKeyboard
            try {
                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                renderPost(bot, ctx)
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'editing_secret_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return 

            try {
                bot.cache.savedMessages[ctx.from.id].messageData.secret = {
                    title: message.text
                }

                const menu = Markup.inlineKeyboard([
                    [Markup.button.callback('◀️ Назад', 'edit_secret_post')]
                ])
                await bot.telegram.deleteMessage(ctx.from.id, bot.cache.waitMessageIds[ctx.from.id])
                await ctx.reply(messages.editSecret2Post, menu).then(m => {
                    bot.cache.waitMessageIds[ctx.from.id] = m.message_id
                })

                bot.cache.status[ctx.from.id] = 'editing_secret2_post'
                return
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'editing_secret2_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return 

            try {
                bot.cache.savedMessages[ctx.from.id].messageData.secret.noshow = message.text

                const menu = Markup.inlineKeyboard([
                    [Markup.button.callback('◀️ Назад', 'edit_secret_post')]
                ])
                await bot.telegram.deleteMessage(ctx.from.id, bot.cache.waitMessageIds[ctx.from.id])
                await ctx.reply(messages.editSecret3Post, menu).then(m => {
                    bot.cache.waitMessageIds[ctx.from.id] = m.message_id
                })

                bot.cache.status[ctx.from.id] = 'editing_secret3_post'
                return
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'editing_secret3_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            if (!message.text) return 

            try {
                bot.cache.savedMessages[ctx.from.id].messageData.secret.show = message.text

                await bot.telegram.deleteMessage(ctx.from.id, bot.cache.waitMessageIds[ctx.from.id])
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                bot.cache.status[ctx.from.id] = 'editing_post'

                await renderPost(bot, ctx)
            } catch (error) {
                console.log(error)
            }
        }

        if (bot.cache.status[ctx.from.id] == 'editing_media_post' && bot.cache.waitMessageIds[ctx.from.id]) {
            console.log(1)
            if (!message.photo && (message.document?.mime_type != 'video/mp4')) return

            try {
                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                if (message.photo) {
                    if (bot.cache.savedMessages[ctx.from.id].type == 'text') {
                        bot.cache.savedMessages[ctx.from.id].messageData.caption = bot.cache.savedMessages[ctx.from.id].messageData.text
                        if (bot.cache.savedMessages[ctx.from.id].messageData.entities) bot.cache.savedMessages[ctx.from.id].messageData.caption_entities = bot.cache.savedMessages[ctx.from.id].messageData.entities
                    } 

                    bot.cache.savedMessages[ctx.from.id].type = 'photo'
                    bot.cache.savedMessages[ctx.from.id].messageData.photo = message.photo
                } else if (message.document?.mime_type == 'video/mp4') {
                    if (bot.cache.savedMessages[ctx.from.id].type == 'text') {
                        bot.cache.savedMessages[ctx.from.id].messageData.caption = bot.cache.savedMessages[ctx.from.id].messageData.text
                        if (bot.cache.savedMessages[ctx.from.id].messageData.entities) bot.cache.savedMessages[ctx.from.id].messageData.caption_entities = bot.cache.savedMessages[ctx.from.id].messageData.entities
                    } 

                    bot.cache.savedMessages[ctx.from.id].type = 'video'
                    bot.cache.savedMessages[ctx.from.id].messageData.video = message.document
                }

                renderPost(bot, ctx)
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'setting_timer' && bot.cache.waitMessageIds[ctx.from.id]) {
            const text = ctx.message.text
            if (!text) return
            if(!checkDate(text).valid) return
            console.log(text)
            try {
                bot.cache.savedMessages[ctx.from.id].time = text

                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                renderSubmit(bot, ctx)
            } catch (error) {
                
            }
        }

        if (bot.cache.status[ctx.from.id] == 'setting_autodelete' && bot.cache.waitMessageIds[ctx.from.id]) {
            const text = ctx.message.text
            if (!text) return
            if(!checkDate(text).valid) return
            console.log(text)
            try {
                bot.cache.savedMessages[ctx.from.id].deleteTime = text

                const messageId = bot.cache.waitMessageIds[ctx.from.id]
                bot.cache.waitMessageIds[ctx.from.id] = undefined
                await bot.telegram.deleteMessage(ctx.from.id, messageId)

                renderSubmit(bot, ctx)
            } catch (error) {
                
            }
        }
    })
}