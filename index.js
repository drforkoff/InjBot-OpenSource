﻿// Подключение "ядра"
const Core = require("./bot/index");
const fs = require("fs");
// Создание нового экземпляра
const bot = new Core({
    access_token: "",   // Токен
    admins: [1]         // Айди администраторов
})
// Подключение лонгпулла
bot.start();
// Модульная система
fs.readdirSync('./plugins').filter(e => e.endsWith('.js')).map(e => {
    bot.commands.push(e);
})
// Пример использования message.plain
bot.on(/^!test/i, "test -- команда для првоерки бота", function (message) {
    return message.plain(`я работаю`);
})
// Пример использования message.append
bot.on(/^!(?:online|онлайн)/i, "online -- покажет пользователей онлайн", function (message, {vk}) {
    vk.api.messages.getChatUsers({
        chat_id: message.chat,
        fields: "online"
    }).then(async function (response) {
        message.append(`Сейчас в чате:`);
        await response.map(e => {
            if(e.id === -152029297) return;
            if(e.online != 0) message.append(`*id${e.id} (${e.first_name.slice(0,1)}. ${e.last_name})`);
        })
        return message.apply({ attachment: "photo435378035_456252104" });
    })
})
// Пример использования message.args + создание админской команды
bot.on(/^!eval\s(.*)/i, "eval -- исполняет JS код", function (message, core) {
    let result = eval(message.args[1]);
    return message.reply (
        typeof result === "object" ? JSON.stringify(result, null, "&#4448;") : result.toString()
    )
}, true)
// Пример с использованием "utils"
bot.on(/^!шар\s(.*)/i, "шар <text> -- ответит <<да>> или <<нет>> на ваш вопрос", function (message, {utils}) {
    return message.plain ( utils.randomPick( ['да', 'нет'] ) )
})
// Пример как выводить все команды, без учета админских
bot.on(/^!help/i, "help -- вывод всех доступных команд", function (message, {commands}) {
    return message.plain(`список доступных команд:\n` +
        commands.filter(cmd => !cmd.admin).map(cmd => '!' + cmd.description).join("\n")
    )
})
// Кубик
bot.on(/^!(?:кубик|dice)\s([1-6])/i, "кубик <1-6> -- игра в кубик", function (message, {utils, users}) {
    let 
        randNumber  = utils.random(6),
        amount      = utils.randomPick([100,200,300,400,500]);

    users[message.user].balance = 
        randNumber == message.args[1] ? 
            users[message.user].balance + amount : users[message.user].balance;
    
    return message.plain ( 
        randNumber == message.args[1] ? 
            `ты загадал - ${message.args[1]}&#8419;\nА мне выпало - ${randNumber}&#8419;\nТы выиграл - ${amount}$` : 
            `ты загадал - ${message.args[1]}&#8419;\nА мне выпало - ${randNumber}&#8419;\nТы не угадал`
    )
})
// Кости
bot.on(/^!(?:кости)\s([0-9]+)/i, "кости <0-9> -- игра в кости", function (message, {utils, users}) {
    let
        dice = { 
            bot:    utils.random(6), 
            user:   utils.random(6)
        },
        amount = Number(message.args[1]);

    users[message.user].balance = 
        dice.bot < dice.user ?
            users[message.user].balance + amount : dice.bot === dice.user ?
                users[message.user].balance : users[message.user].balance - amount;
    
    return message.plain (
        `мне выпало - ${dice.bot}&#8419;\n Тебе выпало - ${dice.user}&#8419;\n` + 
        (dice.bot < dice.user ?
            `Ты выиграл - ${amount}$` : dice.bot === dice.user ?
                `Ничья :)` : `Ты проиграл - ${amount}$`)
    )
})

/** Примеры как сделать модульного бота

    # Примитивный, плохой пример:
        const fs = require("fs");

        fs.readdirSync('./commands').filter(e => e.endsWith('.js')).map(e => {
            cmd = require(e);
            bot.on(cmd.pattern, cmd.description, cmd.func, cmd.admin)
        })

    # Вариант получше:
        const fs = require("fs");

        fs.readdirSync('./commands').filter(e => e.endsWith('.js')).map(e => {
            bot.commands.push(e);
        })

**/