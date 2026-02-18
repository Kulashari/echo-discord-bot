import dotenv from 'dotenv' //imports the dotenv library 
dotenv.config();

import {Client, GatewayIntentBits, EmbedBuilder} from 'discord.js'; //imports the discord.js library to work with the api
import Groq from "groq-sdk"; //imports the groq-sdk library to work with the api

import { readFile } from 'fs/promises'; //imports the file system module 
import path from 'path'; 
import { fileURLToPath } from 'url';

const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?q=hamilton&appid=${process.env.OPENWEATHER_API_KEY}`; //for now hard code the country but change it later for user input
const data = await (await fetch(weatherURL)).json();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); //initializes the groq api
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Function to create Discord embeds with weather data and icons
function createWeatherEmbeds(weatherData) {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
        return [new EmbedBuilder().setDescription("No weather data available")];
    }
    
    const city = weatherData.city?.name || "Unknown";
    const embeds = [];

    // Create embeds for each forecast (1-5)
    for (let i = 1; i <= 5; i++) {
        const forecast = weatherData.list[i];
        if (!forecast) continue;

        const temp = Math.round(forecast.main.temp - 273.15); // Convert Kelvin to Celsius
        const feels_like = Math.round(forecast.main.feels_like - 273.15);
        const description = forecast.weather[0].description;
        const humidity = forecast.main.humidity;
        const icon = forecast.weather[0].icon; // Icon code from API (e.g., "01d", "02n")
        const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`; // OpenWeather icon URL
        
        const embed = new EmbedBuilder()
            .setTitle(`${city} - ${forecast.dt_txt}`)
            .setThumbnail(iconURL) // Set weather icon as thumbnail
            .addFields(
                { name: '🌡️ Temperature', value: `${temp}°C`, inline: true },
                { name: '🤔 Feels Like', value: `${feels_like}°C`, inline: true },
                { name: '💧 Humidity', value: `${humidity}%`, inline: true },
                { name: '☁️ Description', value: description, inline: false }
            )
            .setColor(0x3498db); //Blue color for weather theme
        
        embeds.push(embed);
    }
    
    return embeds;
}  

function getDayIndex(){
    const today = new Date();
    const dayIndex = today.getDay();
    return dayIndex;
}


async function getFileContent(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const data = await readFile(fullPath, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, //server info
        GatewayIntentBits.GuildMessages, //messages sent in servers
        GatewayIntentBits.MessageContent, //content of messages 
        GatewayIntentBits.DirectMessages //dm messages to users
    ],
});

client.login(process.env.DISCORD_TOKEN); //logs bot into discord using token

client.on("messageCreate", async (message) => { //event  listener that triggers when a message is created  
    const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const chatCompletion = await getGroqChatCompletion();
    const modelMessage = chatCompletion.choices[0].message.content; // access the model's response text

    async function getGroqChatCompletion() {
        let txtFile = 'modelPrompt1.txt';
        console.log(getDayIndex());
        switch(getDayIndex()){
            case 0: //sunday
                txtFile = 'modelPrompt1.txt'
                break;
            case 1:
                txtFile = 'modelPrompt1.txt'
                break;
            case 2:
                txtFile = 'modelPrompt2.txt'
                break;
            case 3:
                txtFile = 'modelPrompt3.txt'
                break;
            case 4:
                txtFile = 'modelPrompt4.txt'
                break;
            case 5:
                txtFile = 'modelPrompt5.txt'
                break;
            case 6:
                txtFile = 'modelPrompt2.txt'
                break;
            default: txtFile = 'modelPrompt1.txt'
        }

        const promptContent = await getFileContent(txtFile);
        return groq.chat.completions.create({ //creates a chat completion using the groq api
          messages: [
            {
              role: "user",
              content: promptContent,
            },
          ],
          model: "openai/gpt-oss-120b",
        });
    }

    try {
        if (!message.author.bot){
            // Create Discord embeds with weather data and icons
            const weatherEmbeds = createWeatherEmbeds(data);
            const personalMessage = "My best advice is to stop using motivation as your only fuel. I know it feels great when you're fired up, but it's a short-term fuel source. That's why the vast majority of people who start anything - diet, fitness, new projects - don't finish. They run out of gas. The only lasting fuel is routine. -Arnold Schwarzenegger \n\nDon't waste the day.";
            await message.author.send(today);
            await message.author.send({ embeds: weatherEmbeds }); //bot send's the message in a specific order 
            const spacing = "\n\n"; // one blank line between model and personal
            await message.author.send(modelMessage + spacing + personalMessage);
        }
    } catch (error) {
        console.error('error sending message:', error);
    }
});