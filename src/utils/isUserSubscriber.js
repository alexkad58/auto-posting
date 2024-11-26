/**
 * Проверяет, является ли пользователь подписчиком канала.
 * @param {Object} bot Экземпляр Telegraf бота.
 * @param {string} userId ID пользователя.
 * @param {string} chatId ID канала.
 * @returns {Promise<boolean>} True, если пользователь подписан, иначе False.
 */
async function isUserSubscriber(bot, userId, chatId) {
    try {
        const chatMember = await bot.telegram.getChatMember(chatId, userId);
        // Проверяем статус: пользователь считается подписчиком, если он член, администратор или создатель
        return ['member', 'administrator', 'creator'].includes(chatMember.status);
    } catch (error) {
        console.error('Ошибка проверки подписки:', error.message);
        return false; // Возвращаем false в случае ошибки
    }
}

module.exports = isUserSubscriber