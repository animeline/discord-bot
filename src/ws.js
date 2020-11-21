const WebSocket = require("ws");

const AnimelineEmbed = require("./AnimelineEmbed");

let heartbeatInterval;
let ws;

function heartbeat(interval) {
  heartbeatInterval = setInterval(() => {
    ws.send(JSON.stringify({ op: 9 }));
  }, interval);
}

module.exports = {
  connect: (client) => {
    ws = new WebSocket(client.config.wsURL);

    ws.onopen = () => {
      clearInterval(heartbeatInterval);

      heartbeatInterval = null;
    };

    ws.onmessage = (message) => {
      if (!message.data.length) return;

      let response;

      try {
        response = JSON.parse(message.data);
      } catch (error) {
        return;
      }

      switch (response.op) {
        case 0:
          ws.send(JSON.stringify({ op: 9 }));

          heartbeat(response.d.heartbeat);

          break;
        case 1:
          if (
            response.t !== "TRACK_UPDATE" &&
            response.t !== "TRACK_UPDATE_REQUEST" &&
            response.t !== "QUEUE_UPDATE" &&
            response.t !== "NOTIFICATION"
          )
            break;

          if (client.user.lastMessage && !client.user.lastMessage.deleted)
            client.user.lastMessage.delete();

          client.channels.cache
            .get(client.config.channels[1].id)
            .send(
              new AnimelineEmbed(client.config)
                .setDescription(
                  [
                    `:white_small_square: **Name**: ${response.d.song.title}`,
                    `:white_small_square: **Artists:**: ${response.d.song.artists
                      .map(
                        (artist) =>
                          `[${artist.name}](https://listen.moe/artists/${artist.id})`
                      )
                      .join(", ")}`,
                    `:white_small_square: **Album**: ${
                      response.d.song.albums.length > 0
                        ? response.d.song.albums.map(
                            (album) =>
                              `[${album.name}](https://listen.moe/albums/${album.id})`
                          )
                        : "No albums"
                    }`,
                    `:white_small_square: **Previously songs:**`,
                    response.d.lastPlayed
                      .map(
                        (song) =>
                          `・${song.title} __[${song.artists
                            .map(
                              (artist) =>
                                `[${artist.name}](https://listen.moe/artists/${artist.id})`
                            )
                            .join(", ")}]__`
                      )
                      .join("\n"),
                  ].join("\n")
                )
                .setThumbnail(
                  response.d.song.albums.length > 0
                    ? `https://cdn.listen.moe/covers/${response.d.song.albums[0].image}`
                    : `https://img.icons8.com/ios-filled/50/${client.config.color.replace(
                        "#",
                        ""
                      )}/headphones.png`
                )
                .setTimestamp()
                .setFooter(
                  `Listeners: ${response.d.listeners}`,
                  client.user.avatarURL()
                )
            )
            .then((m) => (client.user.lastMessage = m));          

          client.channels.cache
            .get(client.config.channels[0].id)
            .setName(`⌈ 💿 ⌋ ${response.d.song.title}`);

          client.user.setPresence({
            activity: { name: response.d.song.title, type: "LISTENING" },
          });

          break;
        default:
          break;
      }
    };

    ws.onclose = (error) => {
      clearInterval(heartbeatInterval);

      heartbeatInterval = null;

      if (ws) {
        ws.close();
        ws = null;
      }

      setTimeout(() => connect(), 5000);
    };
  },
};
