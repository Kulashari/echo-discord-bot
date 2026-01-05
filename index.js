import dotenv from 'dotenv' //imports the dotenv library 
dotenv.config();

import {Client, GatewayIntentBits} from 'discord.js'; //imports the discord.js library to work with the api

const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?q=hamilton&appid=${process.env.OPENWEATHER_API_KEY}`; //for now hard code the country but change it later for user input
const data = await (await fetch(weatherURL)).json();

// Function to format weather data into readable text
function formatWeatherData(weatherData) {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
        return "No weather data available";
    }
    
    const city = weatherData.city?.name || "Unknown";

    const firstForecast = weatherData.list[1];
    const temp = Math.round(firstForecast.main.temp - 273.15); // Convert Kelvin to Celsius
    const feels_like = Math.round(firstForecast.main.feels_like - 273.15);
    const description = firstForecast.weather[0].description;
    const humidity = firstForecast.main.humidity;
    const dateTime1 = firstForecast.dt_txt;

    const secondForecast = weatherData.list[2];
    const temp2 = Math.round(secondForecast.main.temp - 273.15);
    const feels_like2 = Math.round(secondForecast.main.feels_like - 273.15);
    const description2 = secondForecast.weather[0].description;
    const humidity2 = secondForecast.main.humidity;
    const dateTime2 = secondForecast.dt_txt;

    const thirdForecast = weatherData.list[3];
    const temp3 = Math.round(thirdForecast.main.temp - 273.15);
    const feels_like3 = Math.round(thirdForecast.main.feels_like - 273.15);
    const description3 = thirdForecast.weather[0].description;
    const humidity3 = thirdForecast.main.humidity;
    const dateTime3 = thirdForecast.dt_txt;

    const fourthForecast = weatherData.list[4];
    const temp4 = Math.round(fourthForecast.main.temp - 273.15);
    const feels_like4 = Math.round(fourthForecast.main.feels_like - 273.15);
    const description4 = fourthForecast.weather[0].description;
    const humidity4 = fourthForecast.main.humidity;
    const dateTime4 = fourthForecast.dt_txt;

    const fifthForecast = weatherData.list[5];
    const temp5 = Math.round(fifthForecast.main.temp - 273.15);
    const feels_like5 = Math.round(fifthForecast.main.feels_like - 273.15);
    const description5 = fifthForecast.weather[0].description;
    const humidity5 = fifthForecast.main.humidity;
    const dateTime5 = fifthForecast.dt_txt;
    
    return `Weather in ${city}:\n\n${dateTime1}\nTemperature: ${temp}°C\nFeels like: ${feels_like}°C\nDescription: ${description}\nHumidity: ${humidity}%\n\n${dateTime2}\nTemperature: ${temp2}°C\nFeels like: ${feels_like2}°C\nDescription: ${description2}\nHumidity: ${humidity2}%\n\n${dateTime3}\nTemperature: ${temp3}°C\nFeels like: ${feels_like3}°C\nDescription: ${description3}\nHumidity: ${humidity3}%\n\n${dateTime4}\nTemperature: ${temp4}°C\nFeels like: ${feels_like4}°C\nDescription: ${description4}\nHumidity: ${humidity4}%\n\n${dateTime5}\nTemperature: ${temp5}°C\nFeels like: ${feels_like5}°C\nDescription: ${description5}\nHumidity: ${humidity5}%`;
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


client.on("messageCreate", async (message) => { //event  litener that triggers when a message is created  
    try {
        if (!message.author.bot){
            // Format the weather data as readable text instead of raw JSON
            const weatherText = formatWeatherData(data);
            await message.author.send(`${weatherText}`);
        }
    } catch (error) {
        console.error('error sending message:', error);
    }
});