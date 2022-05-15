// ID: 973703782393323580
// Invite link: https://discord.com/api/oauth2/authorize?client_id=973703782393323580&scope=bot&permissions=1
const {pipeline} = require("node:stream")
const Discord = require("discord.js");
const {Snowflake} = require("discord.js")
const {token} = require("./token.json");
const { joinVoiceChannel, VoiceReceiver, EndBehaviorType, VoiceConnection } = require('@discordjs/voice')
const fs = require('fs')
const { Readable } = require('stream');
const prism = require('prism-media');


let createCon = function(channelId, guildId, adapterCreator){
    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: adapterCreator,
        selfDeaf: false,
        selfMute: true,
    });
    return connection;
}
const Bot = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL","GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
});
//bot state
Bot.on("ready", function(client) { //create discord client
    console.log("This Bot is now online " + client.user.tag)
});

//message event
Bot.on('messageCreate', function(message){
    if (message.author.bot == false){   //only call when message is from user
        const userInput = message.content.split(" ");  
        if (userInput[0] == "!speak"){//basic call
            message.reply("Hello");
        }
        else if (userInput[0] == "!join"){//join channel call
            /*if (message.member.voice.channel == null){//not in voice channel
                message.reply("Join a voice channel first")
            }*/
            //in voice channel
            message.reply("Ok, I'm in the Voice Channel!")
            let connection = createCon(message.member.voice.channel.id, message.guild.id,message.guild.voiceAdapterCreator);
            let uID = message.id//not sure how to get proper userId
            //connection.receiver.speaking.on('start',function(uID){
            let voiceR = new VoiceReceiver(connection);//connect voiceReciever to voice channel connection

            const opusStream = voiceR.subscribe(message.member,{ 
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 100,
                } })//recieve a stream of opus packets
            
            const oggStream = new prism.opus.OggLogicalBitstream({
                    opusHead: new prism.opus.OpusHead({
                        channelCount:2,
                        sampleRate: 48000,
                    }),
                    pageSizeControl: {
                        maxPackets: 10,
                    },
                    crc:false,
                });
            const fileName = fs.WriteStream('audio.ogg');
            pipeline(opusStream, oggStream, 'fileName', (err) => {
                if (err) {
                    console.warn("Error")
                }
                else{ 
                    console.log('Recorded')
                }
            })
            //});  

        }
        else if (userInput[0] == "!leave"){//leave voice Channel call
            message.reply("Goodbye!")
            connection = createCon(message.member.voice.channel.id, message.guild.id,message.guild.voiceAdapterCreator);
            connection.destroy()
        }
    }
});

Bot.login(token);