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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_1 = require("./service");
const nodemailer = require('nodemailer');
const app = (0, express_1.default)();
const port = 4000 || 5000;
app.use(express_1.default.json());
app.post('/api/SaveWeatherMapping', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        yield (0, service_1.processWeatherData)(data);
        res.status(201).send('Weather data saved successfully');
    }
    catch (error) {
        res.status(500).send('Error processing weather data');
    }
}));
app.get('/api/weatherDashboard', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = req.query.city;
        const weatherInfo = yield (0, service_1.getWeatherInfo)(city);
        res.send(weatherInfo);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the weather data');
    }
}));
app.get('/api/mail', (req, res) => {
    const htmlTable = (0, service_1.mailWeatherData)();
    res.send(htmlTable);
});
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
