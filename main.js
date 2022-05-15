// Invite link: https://discord.com/api/oauth2/authorize?client_id=973703782393323580&scope=bot&permissions=1
const Discord = require("discord.js");
const { token } = require("./token.json");
const fs = require('fs')

const Bot = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
});

Bot.login(token);
Bot.once('ready', function () {
    console.log("bot is ready")
});

Bot.on('message', async function (message) {
    let messageId = message.guild.id
    let adapter = message.guild.voiceAdapterCreator;
    if (message.author.bot == false) {   //only call when message is from user
        const userInput = message.content.split(" ");

        if (userInput[0] == "!join") {//basic call
            console.log("joined voice channel '", message.member.voice.channel.name, "'")
            message.reply("Joined Voice Channel!")

            const connection = await message.member.voice.channel.join()
            const audio = connection.receiver.createStream(message.member, { mode: "opus", end: 'silence' });
            const writer = audio.pipe(fs.createWriteStream("audio.opus"))

            writer.on('finish', function () {
                console.log('stopped recording')
            })
        }
    }
});