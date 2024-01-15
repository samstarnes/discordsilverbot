require('dotenv').config() // Load .env file
const axios = require('axios')
const Discord = require('discord.js')

const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
})

async function getPrices() {
    // API for price data.
    axios.get('https://www.apmex.com/spotprice/gethistoricalchart?metalname=silver').then(res => {
        if (res.headers['content-type'] === 'application/json') {
            // If we got a valid response
            if(res) {
                let currentPrice = String(Object.entries(res.data.chartdata)[Object.keys(res.data.chartdata).length-1]).split(",")[2] || 0 // Default to zero
                let symbol = '?'
                client.guilds.cache.forEach((guild) => { // This is to get all guild that the bot joined
                    client.guilds.cache.find(guild => guild.id === process.env.SERVER_ID1).members.me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice)}`)
                    client.guilds.cache.find(guild => guild.id === process.env.SERVER_ID2).members.me.setNickname(`${process.env.CURRENCY_SYMBOL}${(currentPrice)}`)
                });
                client.user.setPresence({
                    game: {
                        // Example: "Watching -5,52% | BTC"
                        name: `silver prices | XAG`,
                        type: 3 // Use activity type 3 which is "Watching"
                    }
                })
                console.log('Updated price to', currentPrice)
            } else {
                console.log('Could not load player data count for', process.env.COIN_ID)
            }
        } else {
            console.log('Unexpected response type:', res.headers['content-type']);
        }
    }).catch(err => console.log('Error at apmex spotprice data:', err))
}

// Runs when client connects to Discord.
client.on('ready', () => {
    console.log('Logged in as', client.user.tag)

    getPrices() // Ping server once on startup
    // Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
    setInterval(getPrices, Math.max(1, process.env.MC_PING_FREQUENCY || 1) * 60 * 1000)
})

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
