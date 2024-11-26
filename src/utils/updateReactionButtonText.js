/**
 * Обновляет текст кнопки с реакцией, увеличивая её значение.
 * @param {string} buttonText Текст кнопки.
 * @returns {string} Обновлённый текст кнопки.
 */
const updateReactionButtonText = async (buttonText, ctx, bot) => {
    buttonText = buttonText.replace(/[0-9]/g, '').trim();
    const path = `/reactions/${ctx.update.callback_query.message.chat.id}/${ctx.update.callback_query.message.message_id}/${buttonText}`
    let reactionData
    try {
        reactionData = await bot.db.getData(path)
    } catch (error) {
        reactionData = {}
    }

    if (!reactionData[buttonText]) reactionData[buttonText] = []
    
    if (reactionData[buttonText].includes(ctx.from.id)) {
        const index = reactionData[buttonText].indexOf(ctx.from.id);
        if (index !== -1) {
            reactionData[buttonText].splice(index, 1);
        }
    } else {
        reactionData[buttonText].push(ctx.from.id)
    }

    const count = reactionData[buttonText].length
    
    try {
        reactionData = await bot.db.push(path, reactionData)
    } catch (error) {
        
    }
    console.log(`${buttonText} ${count}`)
    const newButtonText = count > 0 ? `${buttonText} ${count}` : buttonText
    return newButtonText
}

module.exports = updateReactionButtonText