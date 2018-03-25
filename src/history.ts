import CircularBuffer from "./circular-buffer";

const HISTORY_SIZE = 1000;

interface ChatHistories {
  [chatId: string]: CircularBuffer;
}

export default class Histories {
  private historyByChatId: ChatHistories = {};

  constructor() {}

  addMessage(chatId: number, msg: any) {
    let history = this.historyByChatId[chatId];

    if (!history) {
      history = new CircularBuffer(HISTORY_SIZE);
      this.historyByChatId[chatId] = history;
    }

    history.push(msg);
  }

  findHistoryStartingFrom(msg) {
    for (const chatId of Object.keys(this.historyByChatId)) {
      const history = this.historyByChatId[chatId];

      const index = history.findIndex(
        historyMsg => historyMsg.date === msg.forward_date
      );
      if (index !== null) {
        return history.get(0, index + 2);
      }
    }

    return null;
  }
}
