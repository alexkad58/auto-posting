module.exports = async (bot, post) => {
    const { channels, messageData, message_id } = post

    for (const channelId of channels) {
        try {
            if (!message_id) return
            bot.telegram.deleteMessage(channelId, message_id)
        } catch (error) {
            console.log(error)
        }
    }
}