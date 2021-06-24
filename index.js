const fs = require('fs'),
    { Client, } = require('discord.js')

const { target } = require('./config.json')
const client = new Client()
const TOKEN = process.env.NODE_ENV['TOKEN'] || '';

let previousChannel, connection, dispather;
client
    .on('ready', () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    .on('voiceStateUpdate', async (oldState, newState) => {
        if (newState.id == client.user.id) return
        if (newState.channelID !== null) previousChannel = newState.channelID
        if (newState.channelID == null && target.includes(newState.id) && !!previousChannel) {
            client.channels.cache.get(previousChannel).leave()
            return [previousChannel, dispather] = [null, null];
        }

        if (!target.includes(newState.id)) return
        let channel = client.channels.cache.get(newState.channelID)
        if (!channel) return

        return connection = await channel.join()
    })
    .on('guildMemberSpeaking', async (member, speaking) => {
        if (!connection) return
        if (!target.includes(member.user.id)) return

        if (!dispather)
            dispather = connection.play(fs.createReadStream('./audio.mp3'), {
                volume: 15
            })
        else if (dispather && !speaking.bitfield) {
            dispather.destroy()
            dispather = undefined
        }
    })
    .on('error', console.log)
    .on('warn', console.warn)
    .login(TOKEN)

process.on('unhandledRejection', console.log)