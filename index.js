import dotenv from 'dotenv' //imports the dotenv library 
dotenv.config();

import {Client, GatewayIntentBits} from 'discord.js'; //imports the discord.js library to work with the api

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, //server info
        GatewayIntentBits.GuildMessages, //messages sent in servers
        GatewayIntentBits.MessageContent, //content of messages 
        GatewayIntentBits.DirectMessages //dm messages to users
    ],
});

client.login(process.env.DISCORD_TOKEN); //logs bot into discord using token


client.on("messageCreate", async (message) => { //event  litener that triggers when a message is created  
    try {
        if (!message.author.bot){
            await message.author.send(`echo ${message.content}`);
        }
    } catch (error) {
        console.error('error sending message:', error);
    }
});