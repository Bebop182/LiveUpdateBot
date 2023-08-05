import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const ytChannel = process.env.YT_CHANNEL;
const ddChanName = process.env.DD_CHANNEL;
const liveUrl = `https://www.youtube.com/${ytChannel}/live`;
const liveThreshold = 500000;
const updateRate = 5000;

let ddChannel = undefined;
let lastStatus = false;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  ddChannel = client.channels.cache.find((c) => c.name === ddChanName);
  if (ddChannel != undefined) console.log(`channel ${ddChanName} found`);
});

setInterval(UpdateLiveStatus, updateRate);

async function UpdateLiveStatus() {
  const request = await fetch(liveUrl, {
    method: "HEAD",
  });
  const contentLength = request.headers.get("content-length");
  const isLive = contentLength > liveThreshold;
  const now = new Date();
  console.log(
    `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ` +
      (isLive ? "live!" : "offline")
  );

  if (isLive && isLive != lastStatus) {
    // live has started, must notify everyone!
    if (ddChannel != undefined) PublishUpdate();
  }

  lastStatus = isLive;
}

async function PublishUpdate() {
  const prompts = [
    "Going live!",
    "Live right now!",
    "Playing right now!",
    "Live now!",
    "It’s time for stream!",
  ];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  try {
    ddChannel.send(ytChannel + ` ${prompt} ` + liveUrl);
  } catch (e) {
    console.log(e);
  }
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
