const fs = require('fs');
const { Parser } = require('json2csv');

// Функция для генерации статистики и отправки файла
const generateAndSendStatistics = async (ctx, db, bot) => {
    const users = await db.getData('/users'); // Получаем список пользователей
    const channels = await db.getData('/channels'); // Получаем список каналов

    const statistics = [];
    const userStats = users.map(user => ({
        id: user,
        username: null, // Заполним позже
        name: null,     // Заполним позже
        channelCount: 0 // Подсчёт каналов
    }));

    // Перебираем каналы и собираем информацию о администраторах
    for (const [channelId, channelData] of Object.entries(channels)) {
        try {
            const admins = await bot.telegram.getChatAdministrators(channelId);

            // Проверяем, есть ли среди администраторов пользователи из базы
            admins.forEach(admin => {
                if (!admin.user.is_bot && users.includes(admin.user.id)) {
                    const userStat = userStats.find(u => u.id === admin.user.id);
                    if (userStat) {
                        userStat.channelCount += 1;
                        userStat.username = admin.user.username || '';
                        userStat.name = admin.user.first_name || '';
                    }
                }
            });
        } catch (error) {
            console.error(`Ошибка получения администраторов для канала ${channelId}:`, error);
        }
    }

    // Форматируем данные для CSV
    userStats.forEach(user => {
        statistics.push({
            ID: user.id,
            Username: user.username,
            Имя: user.name,
            КоличествоКаналов: user.channelCount
        });
    });

    // Генерация CSV
    const fields = ['ID', 'Username', 'Имя', 'КоличествоКаналов'];
    const parser = new Parser({ fields, delimiter: ';' });
    const csv = parser.parse(statistics);

    // Сохранение файла
    const filePath = './statistics.csv';
    fs.writeFileSync(filePath, csv, 'utf8');

    // Составление сообщения
    const totalChannels = Object.keys(channels).length;
    const totalUsers = users.length;
    const message = `📊 **Статистика**\n\n- Общее количество подключенных каналов: ${totalChannels}\n- Общее количество пользователей: ${totalUsers}`;

    // Отправка файла с подписью
    await ctx.replyWithDocument(
        { source: filePath, filename: 'statistics.csv' },
        { caption: message, parse_mode: 'Markdown' }
    );

    // Удаляем временный файл
    fs.unlinkSync(filePath);
}

module.exports = generateAndSendStatistics;
