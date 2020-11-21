const { MessageEmbed } = require("discord.js");

class AnimelineEmbed extends MessageEmbed {
  constructor(config) {
    super();

    this.setAuthor(
      "listen.moe - J-POP",
      "https://cdn.discordapp.com/avatars/222167140004790273/1e83e8b7302d5aee17be283e7f86294b.png",
      "https://listen.moe/"
    );

    this.setColor(config.color);
  }
}

module.exports = AnimelineEmbed;
