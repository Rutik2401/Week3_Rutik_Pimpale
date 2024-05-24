"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailWeatherData = exports.getWeatherInfo = exports.processWeatherData = void 0;
const axios = require('axios');
const weatherModel_1 = require("./weatherModel");
const nodemailer = require('nodemailer');
const geocodeApiKey = 'Tql7Z1mEl1e6W87VMzbJkw==C5Rspq6cvEkKhDsQ';
const weatherApiKey = 'a415a40140mshb40e5b14917e8e9p1ef68cjsn349e2bf5c466';
const fetchCoordinates = (city, country) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("City--->Country", city, country);
        const response = yield axios.get(`https://api.api-ninjas.com/v1/geocoding`, {
            params: { city, country },
            headers: { 'X-Api-Key': geocodeApiKey },
        });
        console.log("Response->", response);
        return response.data[0];
    }
    catch (error) {
        console.error(`Error while fetching coordinates for ${city}, ${country}:`, error);
    }
});
function fetchWeather(latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get('https://weatherapi-com.p.rapidapi.com/current.json', {
                params: { q: `${latitude},${longitude}` },
                headers: {
                    'X-RapidAPI-Key': 'a415a40140mshb40e5b14917e8e9p1ef68cjsn349e2bf5c466',
                    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
                },
            });
            return response.data.current;
        }
        catch (error) {
            console.error(`Error Whilee fetching weather coordinates ${latitude}, ${longitude}:`, error);
        }
    });
}
const saveWeatherData = (city, country, weather, latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield weatherModel_1.Weather.create({ city, country, weather, time: new Date(), longitude, latitude, });
    }
    catch (err) {
        console.error(`Error While Saving Weather Data  ${city}, ${country}:`, err);
    }
});
const processWeatherData = (cities) => __awaiter(void 0, void 0, void 0, function* () {
    for (const { city, country } of cities) {
        try {
            const coordinates = yield fetchCoordinates(city, country);
            if (!coordinates)
                continue;
            const { latitude, longitude } = coordinates;
            const weatherData = yield fetchWeather(latitude, longitude);
            if (!weatherData)
                continue;
            yield saveWeatherData(city, country, weatherData.condition.text, latitude, longitude);
        }
        catch (err) {
            console.error(`Error While Processing Weather Data for ${city}, ${country}:`, err);
        }
    }
});
exports.processWeatherData = processWeatherData;
const getWeatherInfo = (city) => __awaiter(void 0, void 0, void 0, function* () {
    if (city) {
        const weatherData = yield weatherModel_1.Weather.findAll({
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
    }
    else {
        const [results] = yield weatherModel_1.Weather.sequelize.query(`
            SELECT DISTINCT ON (city) id, city, country, weather, time AS date
            FROM weather
            ORDER BY city, time DESC
        `);
        return results.map((record) => ({
            id: record.id,
            city: record.city,
            country: record.country,
            date: record.date,
            weather: record.weather
        }));
    }
});
exports.getWeatherInfo = getWeatherInfo;
const mailWeatherData = () => __awaiter(void 0, void 0, void 0, function* () {
    const weatherData = yield fetchWeatherData();
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
    yield transporter.sendMail(info);
    return htmlTable;
});
exports.mailWeatherData = mailWeatherData;
const fetchWeatherData = () => __awaiter(void 0, void 0, void 0, function* () {
    const weatherData = yield weatherModel_1.Weather.findAll();
    return weatherData.map(dataValues => ({
        id: dataValues.id,
        city: dataValues.city,
        country: dataValues.country,
        weather: dataValues.weather,
        time: dataValues.time,
        longitude: dataValues.longitude,
        latitude: dataValues.latitude
    }));
});
