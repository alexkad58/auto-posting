const { updateAdministrators } = require("./main");

module.exports = async (bot) => {
    bot.on('my_chat_member', async (ctx) => {
        console.log()
        const chatId = ctx.chat.id;
        const newStatus = ctx.update.my_chat_member.new_chat_member.status;
        console.log(newStatus)
        const oldStatus = ctx.update.my_chat_member.old_chat_member.status;
      
        if ((newStatus === 'administrator') && ctx.chat.type == 'channel') {
            try {
                const chatData = {
                    id: chatId,
                    title: ctx.chat.title || 'Личный чат',
                    type: ctx.chat.type,
                };

                bot.db.push(`/channels/${chatId}`, chatData);
                console.log(`Бот добавлен в чат: ${chatId} (${chatData.title}), ${ctx.chat.type}`);
            } catch (error) {
                console.error('Ошибка при добавлении чата в базу данных:', error);
            }
        } else if ((newStatus === 'left' || newStatus === 'kicked') && ctx.chat.type == 'channel') {
            try {
                bot.db.delete(`/channels/${chatId}`);
                console.log(`Бот удалён из чата: ${chatId}`);
            } catch (error) {
                console.error('Ошибка при удалении чата из базы данных:', error);
            }
        }

        updateAdministrators(bot)
      });
}