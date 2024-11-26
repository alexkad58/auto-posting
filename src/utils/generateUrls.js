const { Markup } = require('telegraf');

function isValidUrl(url) {
    try {
        const parsedUrl = new URL(url);
        
        // Проверяем, что протокол - http или https
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return false;
        }
        
        // Проверяем, что хост содержит точку (например, mysite.com)
        const hostname = parsedUrl.hostname;
        if (!hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.')) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Генерирует URL-клавиатуру на основе сообщения.
 * @param {string} message Текст сообщения с форматом "name-url".
 * @returns {Markup.InlineKeyboardMarkup} Клавиатура с кнопками.
 */
function generateUrlKeyboard(message) {
    const lines = message.split('\n'); // Разделяем строки
    const keyboard = [];

    for (const line of lines) {
        const buttons = line.split(' ') // Разделяем по пробелам
            .filter(item => item.includes('|')) // Проверяем пары name-url
            .map(item => {
                const [name, url] = item.split('|');
                if (!isValidUrl(url)) return
                return Markup.button.url(name, url);
            });

        if ((buttons.length > 0) && !buttons.includes(undefined)) {
            console.log(buttons)
            keyboard.push(buttons); // Добавляем кнопки как отдельную строку клавиатуры
        } else {
            return undefined
        }
    }

    return Markup.inlineKeyboard(keyboard);
}

module.exports = generateUrlKeyboard