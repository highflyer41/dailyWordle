const axios = require("axios").default;
const PORT = 8000;
const express = require("express");
require('dotenv').config();
const cors = require("cors");

const app = express();
app.listen(PORT, () => console.log('Server running on port: ' + PORT));
app.use(cors());

app.get('/word', (req,res) => {
    const options = {
        method: 'GET',
        url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
        params: {count: '5', wordLength: '5'},
        headers: {
            'x-rapidapi-host': 'random-words5.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        }
    };

    axios.request(options).then((response) => {
        res.json(response.data[0]);
    }).catch((error) => {
	    console.error(error);
    });
})

app.get('/check', (req,res) => {
    const word = req.query.word;

    const options = {
      method: 'GET',
      url: 'https://dictionary-by-api-ninjas.p.rapidapi.com/v1/dictionary',
      params: {word: word},
      headers: {
        'x-rapidapi-host': 'dictionary-by-api-ninjas.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY
      }
    };
    
    axios.request(options).then((response) => {
        res.json(response.data.valid);
    }).catch((error) => {
        console.error(error);
    });
})
