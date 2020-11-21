const { Client } = require("discord.js");
const { inspect } = require("util");

const AnimelineEmbed = require("./AnimelineEmbed");

const ws = require("./ws");

class AnimelineClient extends Client {
  constructor(options = {}) {
    super(options);

    this.token = options.token;
    this.config = options.config;

    this.once("ready", () => {
      this.channels.cache
        .get(this.config.channels[0].id)
        .join()
        .then((connection) => {
          const broadcast = this.voice.createBroadcast();

          broadcast.play(this.config.radioURL);

          connection.play(broadcast);

          ws.connect(this);
        });

      console.log(this.user.username, "is currently online");
    });

    this.on("message", async (message) => {
      if (message.author.bot || message.channel.type === "dm") return;

      const prefix = this.getPrefix(message);

      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();

      if (["eval", "ev", "e"].includes(command)) {
        if (!args[0])
          return message.channel.send(
            `**${message.author.username}**, type something!`
          );

        try {
          const code = args.join(" ");
          const evaledCode = await eval(code);

          let msgEvaled = `${evaledCode}`;

          const type = typeof evaledCode;

          if (type !== "string") msgEvaled = inspect(evaledCode, { depth: 0 });

          return message.channel.send(`\`\`\`js\n${msgEvaled}\`\`\``);
        } catch (error) {
          return message.channel.send(`\`\`\`js\n${error.message}\`\`\``);
        }
      }
    });
  }

  getPrefix(message) {
    const content = message.content.toLowerCase();

    return this.config.prefixes.find((prefix) => content.startsWith(prefix));
  }

  start() {
    super.login(this.token);

    return true;
  }
}

module.exports = AnimelineClient;
