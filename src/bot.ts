import TelegramBot, { Message } from "node-telegram-bot-api";
import Histories from "./history";
import HistoryFormatter from "./history-formatter";
import { getAudio, API_MAX_LEN } from "./speech";

// replace the value below with the Telegram token you receive from @BotFather
const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
if (!TELEGRAM_API_TOKEN) {
  throw new Error("TELEGRAM_API_TOKEN env variable must configured");
}

const histories = new Histories();

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

const historyFormatter = new HistoryFormatter(API_MAX_LEN);

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg: Message) => {
  const chatId = msg.chat.id;

  if (msg.chat.type === "private") {
    console.log("Finding history");
    const history = histories.findHistoryStartingFrom(msg);
    if (!history) {
      bot.sendMessage(chatId, "History not found");
    } else {
      const formattedHistory = historyFormatter.format(history);
      console.log(formattedHistory);
      bot.sendMessage(chatId, "History found. Creating audio file...");
      textToSpeech(chatId, formattedHistory);
    }
  } else {
    histories.addMessage(chatId, msg);
  }

  console.dir(msg);
});

async function textToSpeech(chatId: number, texts: string[]) {
  const audioStream = await getAudio(texts);

  // const msg = await bot.sendAudio(chatId, audioStream);
  // console.dir(msg);
}
