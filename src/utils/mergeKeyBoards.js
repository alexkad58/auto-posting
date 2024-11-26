const { Markup } = require('telegraf');

/**
 * Объединяет два объекта Markup с inline-кнопками.
 * @param {Markup.InlineKeyboardMarkup} markup1 Первая клавиатура.
 * @param {Markup.InlineKeyboardMarkup} markup2 Вторая клавиатура.
 * @returns {Markup.InlineKeyboardMarkup} Объединённая клавиатура.
 */
function mergeKeyboards(markup1, markup2) {
    const keyboard1 = markup1.reply_markup.inline_keyboard || [];
    const keyboard2 = markup2.reply_markup.inline_keyboard || [];
    
    // Объединяем массивы кнопок
    const mergedKeyboard = [...keyboard1, ...keyboard2];

    return Markup.inlineKeyboard(mergedKeyboard);
}

module.exports = mergeKeyboards