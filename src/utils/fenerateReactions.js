const { Markup } = require('telegraf');

/**
 * Генерирует кнопки реакций на основе текста.
 * @param {string} text Текст, содержащий реакции.
 * @returns {Markup.InlineKeyboardMarkup} Сгенерированная клавиатура.
 */
function generateReactionButtonsFromText(text) {
    const rows = text.split('\n');
    const keyboard = rows.map((row) => {
        const buttons = row.split('-').map((reaction) => {
            const trimmedReaction = reaction;
            return Markup.button.callback(trimmedReaction, `reaction_${trimmedReaction}`);
        });
        return buttons;
    });

    return Markup.inlineKeyboard(keyboard);
}

module.exports = generateReactionButtonsFromText