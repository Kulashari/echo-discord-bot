import dotenv from 'dotenv' //imports the dotenv library 
dotenv.config();

import {Client, GatewayIntentBits, EmbedBuilder} from 'discord.js'; //imports the discord.js library to work with the api
import Groq from "groq-sdk"; //imports the groq-sdk library to work with the api

const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?q=hamilton&appid=${process.env.OPENWEATHER_API_KEY}`; //for now hard code the country but change it later for user input
const data = await (await fetch(weatherURL)).json();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); //initializes the groq api


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
    const chatCompletion = await getGroqChatCompletion();
    const modelMessage = chatCompletion.choices[0].message.content; // access the model's response text

    async function getGroqChatCompletion() {
        return groq.chat.completions.create({ //creates a chat completion using the groq api
          messages: [
            {
              role: "user",
              content: "Give me a discipline speech about getting out of bed every morning when I wake up, while also mentioning to not depend on motivation and that time is running out. While making sure this message will get me out of bed, don't be soft either and making sure it's less then 2000 characters.",
            },
          ],
          model: "openai/gpt-oss-20b",
        });
    }

    try {
        if (!message.author.bot){
            // Create Discord embeds with weather data and icons
            const weatherEmbeds = createWeatherEmbeds(data);
            const personalMessage = "Seek Discomfort."; // your message at the end
            await message.author.send({ embeds: weatherEmbeds });
            await message.author.send(modelMessage + "\n\n" + personalMessage);
        }
    } catch (error) {
        console.error('error sending message:', error);
    }
});