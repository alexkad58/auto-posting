const { Markup } = require('telegraf');

/**
 * Генерирует клавиатуру с кнопками на основе массива объектов.
 * @param {Array<Object>} dataArray Массив объектов с полем `title`.
 * @returns {Markup.InlineKeyboardMarkup} Сгенерированная клавиатура.
 */
async function generateKeyboardWithRandomId(bot, secret) {
    const randomId = Math.random().toString(36).substring(2, 10); // Генерация случайного ID

    try {
        await bot.db.push(`/secrets/${randomId}`, {
            show: secret.show,
            noshow: secret.noshow
        })
    } catch (error) {
        console.log(error)
    }
    return Markup.inlineKeyboard([ Markup.button.callback(secret.title, `secret_data_${randomId}`)]);
}

module.exports = generateKeyboardWithRandomId