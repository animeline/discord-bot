require("dotenv/config");

const AnimelineClient = require("./src/AnimelineClient");

const config = require("./config");

const client = new AnimelineClient({
  token: process.env.TOKEN,
  config,
});

client.start();
