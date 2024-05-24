import express, { Request, Response } from 'express';
import { processWeatherData, getWeatherInfo, mailWeatherData } from './service';
const nodemailer = require('nodemailer');

const app = express();

const port = 4000 || 5000;

app.use(express.json());

app.post('/api/SaveWeatherMapping', async (req: Request, res: Response) => {
    const data = req.body;
    try {
        await processWeatherData(data);
        res.status(201).send('Weather data saved successfully');
    } catch (error) {
        res.status(500).send('Error processing weather data');
    }
});

app.get('/api/weatherDashboard', async (req, res) => {
    try {
        const city = req.query.city as string | undefined;
        const weatherInfo = await getWeatherInfo(city);
        res.send(weatherInfo);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the weather data');
    }
});


app.get('/api/mail', (req, res) => {
    const htmlTable = mailWeatherData();
    res.send(htmlTable);
})
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
