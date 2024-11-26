const { Markup } = require('telegraf');

const generateCalendarChannelsMenu = async (bot, ctx) => {
    const fromId = ctx.from.id
    const keyboard = []
    const channels = bot.cache.adminMap[fromId]

    if (channels) {
        try {
            for (const channelId of channels) {
                const channelData = await bot.db.getData(`/channels/${channelId}`)
                if (!channelData) continue;                
                keyboard.push([Markup.button.callback(channelData.title, `calendar_channel_${channelId}`)])
            }
        } catch (error) {
            
        }
        if (channels.includes('news')) {
            keyboard.push([Markup.button.callback('📤 Рассылка', 'calendar_channel_news')])
        }
    }
    
    keyboard.push([Markup.button.callback('◀️ Назад', 'posting')])
    return Markup.inlineKeyboard(keyboard)
}

const generateChannelsMenu = async (bot, ctx) => {
    const fromId = ctx.from.id
    const keyboard = []
    const channels = bot.cache.adminMap[fromId]

    if (channels) {
        try {
            for (const channelId of channels) {
                const channelData = await bot.db.getData(`/channels/${channelId}`)
                if (!channelData) continue;
                keyboard.push([Markup.button.callback(channelData.title, `manage_channel_${channelId}`)])
            }
        } catch (error) {
            
        }
    }

    keyboard.push([Markup.button.callback('➕ Добавить канал', 'add_channel')], [Markup.button.callback('◀️ Назад', 'posting')])
    return Markup.inlineKeyboard(keyboard)
}

const generateChannelsSelect = async (bot, ctx) => {
    const fromId = ctx.from.id
    const keyboard = []
    const channels = bot.cache.adminMap[fromId]

    if (channels) {
        try {
            for (const channelId of channels) {
                if (channelId == 'news') continue
                const channelData = await bot.db.getData(`/channels/${channelId}`)
                let pin = ''
                if (!channelData) continue;
                if (bot.cache.savedMessages[fromId].channels?.includes(channelId)) pin = '📍'
                keyboard.push([Markup.button.callback(pin + channelData.title, `select_channel_${channelId}`)])
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (bot.cache.adminMap[ctx.from.id].includes('news')) {
        keyboard.push([Markup.button.callback('📤 Рассылка', 'select_news')])
    }
    keyboard.push([Markup.button.callback('◀️ Назад', 'render_post'), Markup.button.callback('Далее ▶️', 'submit_posting')])
    return Markup.inlineKeyboard(keyboard)
}

const updateAdministrators = async (bot) => {
    const channels = await bot.db.getData('/channels')
    const chatList = Object.keys(channels)
    try {
        const adminMap = {}; 
    
        for (const chatId of chatList) {
            try {
                const admins = await bot.telegram.getChatAdministrators(chatId);
        
                const botAdmin = admins.find((admin) => admin.user.id === bot.botInfo.id);
                if (!botAdmin) {
                    console.log(`Бот не является администратором в чате ${chatId}`);
                    continue;
                }
                admins.forEach((admin) => {
                    const userId = admin.user.id;

                    if (adminMap[userId]) {
                        adminMap[userId].push(chatId);
                    } else {
                        adminMap[userId] = [chatId];
                    }
                    if (userId == process.env.ADMIN_ID || userId == require('../../config/adminId')) {
                        adminMap[userId].push('news');
                    }
                });
            } catch (error) {
                console.error(`Ошибка при обработке чата ${chatId}:`, error);
            }
        }
        
        bot.cache.adminMap = adminMap
    } catch (error) {
        console.error('Ошибка при получении администраторов:', error);
        return null;
    }
}

const checkDate = (input) => {
    const dateTimeRegex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
  
    const match = input.match(dateTimeRegex);
    if (!match) {
      return { valid: false, error: 'Неверный формат. Используйте DD.MM.YYYY HH:mm.' };
    }
  
    const [, day, month, year, hours, minutes] = match.map(Number);
  
    const date = new Date(year, month - 1, day, hours, minutes);
  
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date.getHours() !== hours ||
      date.getMinutes() !== minutes
    ) {
      return { valid: false, error: 'Некорректная дата или время.' };
    }
  

    const now = new Date();
    if (date <= now) {
      return { valid: false, error: 'Указанная дата уже прошла.' };
    }
  
    return { valid: true, error: null };
}

const generateCurrentDateTimeString = () => {
    const now = new Date();
  
    const day = String(now.getDate()).padStart(2, '0'); // День с ведущим нулем
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяц с ведущим нулем (январь = 0)
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0'); // Часы с ведущим нулем
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Минуты с ведущим нулем
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

module.exports = { generateChannelsMenu, generateChannelsSelect, updateAdministrators, checkDate, generateCurrentDateTimeString, generateCalendarChannelsMenu }