const axios =require ('axios');
import { Weather } from './weatherModel';
const nodemailer = require('nodemailer');

const geocodeApiKey = 'Tql7Z1mEl1e6W87VMzbJkw==C5Rspq6cvEkKhDsQ';
const weatherApiKey = 'a415a40140mshb40e5b14917e8e9p1ef68cjsn349e2bf5c466';


interface City {
    city: string;
    country: string;
}

const fetchCoordinates = async (city: string, country: string) => {
    try {
        console.log("City--->Country", city, country);
        const response = await axios.get(`https://api.api-ninjas.com/v1/geocoding`, {
            params: { city, country },
            headers: { 'X-Api-Key': geocodeApiKey },
        });
        console.log("Response->",response);
        return response.data[0];
    } catch (error) {
        console.error(`Error while fetching coordinates for ${city}, ${country}:`, error);
    }
};

async function fetchWeather(latitude: number, longitude: number) {
    try {
        const response = await axios.get('https://weatherapi-com.p.rapidapi.com/current.json', {
            params: { q: `${latitude},${longitude}` },
            headers: {
                'X-RapidAPI-Key': 'a415a40140mshb40e5b14917e8e9p1ef68cjsn349e2bf5c466',
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
            },
        });
        return response.data.current;
    } catch (error) {
        console.error(`Error Whilee fetching weather coordinates ${latitude}, ${longitude}:`, error);
    }
}

const saveWeatherData = async (city: string, country: string, weather: string, latitude: number, longitude: number) => {
    try {
        await Weather.create({ city, country, weather, time: new Date(), longitude, latitude, });
    } catch (err) {
        console.error(`Error While Saving Weather Data  ${city}, ${country}:`, err);
    }
};

const processWeatherData = async (cities: City[]) => {
    for (const { city, country } of cities) {
        try {
            const coordinates = await fetchCoordinates(city, country);
            if (!coordinates) continue;

            const { latitude, longitude } = coordinates;
            const weatherData = await fetchWeather(latitude, longitude);
            if (!weatherData) continue;

            await saveWeatherData(city, country, weatherData.condition.text, latitude, longitude);
        } catch (err) {
            console.error(`Error While Processing Weather Data for ${city}, ${country}:`, err);
        }
    }
};


const getWeatherInfo = async (city?: string) => {
    if (city) {
        const weatherData = await Weather.findAll({
            where: { city }
        });
        console.log(weatherData);
        return weatherData.map(record => ({
            id: record.id,
            city: record.city,
            country: record.country,
            date: record.time,
            weather: record.weather
        }));
    } else {
        const [results] = await Weather.sequelize!.query(`
            SELECT DISTINCT ON (city) id, city, country, weather, time AS date
            FROM weather
            ORDER BY city, time DESC
        `);
        return results.map((record: any) => ({
            id: record.id,
            city: record.city,
            country: record.country,
            date: record.date,
            weather: record.weather
        }));
    }
};


const mailWeatherData = async () => {
    const weatherData = await fetchWeatherData();
    const tableHeaders = `
    <tr>
        <th>ID</th>
        <th>City</th>
        <th>Country</th>
        <th>Weather</th>
        <th>Time</th>
        <th>Longitude</th>
        <th>Latitude</th>
    </tr>`;
    const tableRows = weatherData.map(row => `<tr>
                <td>${row.id}</td>
                <td>${row.city}</td>
                <td>${row.country}</td>
                <td>${row.weather}</td>
                <td>${row.time}</td>
                <td>${row.longitude}</td>
                <td>${row.latitude}</td>
                </tr>`).join('');

    const htmlTable = `<table border="1">
                    <thead>${tableHeaders}</thead>
                    <tbody>${tableRows}</tbody>
                    </table>`;
                    console.log(htmlTable);

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server
        port: 465, // Replace with your SMTP port
        auth: {
            user: 'rutikpimpale24@gmail.com ', // Replace with your SMTP email
            pass: 'nodejs@1234' // Replace with your SMTP password
        }
    });
    const info = {
        from: 'rutikpimpale24@gmail.com ', // Sender address
        to: "rutikpimpale@gmail.com ", // List of recipients
        subject: "Hello Rutik", // Subject line
        html: htmlTable // HTML body
    };
    await transporter.sendMail(info);
    return  htmlTable;

}
const fetchWeatherData = async () => {
    const weatherData = await Weather.findAll();
    return weatherData.map(dataValues => ({
        id: dataValues.id,
        city: dataValues.city,
        country: dataValues.country,
        weather: dataValues.weather,
        time: dataValues.time,
        longitude: dataValues.longitude,
        latitude: dataValues.latitude
    }));
}


export { processWeatherData, getWeatherInfo, mailWeatherData };
