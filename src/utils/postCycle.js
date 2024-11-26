const { generateCurrentDateTimeString } = require("./main")
const sendPost = require("./sendPost")
const deletePost = require("./deletePost")

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))


module.exports = async (bot) => {
    while (true) {
        await sleep(4000)
        const dateNow = generateCurrentDateTimeString();

    try {
        const posts = await bot.db.getData('/posts') || [];
        const remainingPosts = [];

        for (const post of posts) {
            if (post.time === dateNow) {
                try {
                    await sendPost(bot, post);
                    post.time = ''
                } catch (error) {
                    console.error(`Ошибка отправки поста: ${error.message}`);
                }
            } else if (post.deleteTime === dateNow) {
                try {
                    await deletePost(bot, post);
                } catch (error) {
                    console.error(`Ошибка удаления поста: ${error.message}`);
                }
            } else {
                remainingPosts.push(post);
            }
        }

        await bot.db.push('/posts', remainingPosts); 
    } catch (error) {
        console.error(`Ошибка при обработке постов: ${error.message}`);
    }
    }
}