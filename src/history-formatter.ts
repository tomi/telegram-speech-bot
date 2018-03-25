import { Message } from "node-telegram-bot-api";

interface Translation {
  texts: string[];
}

export default class HistoryFormatter {
  constructor(private maxLen: number) {}

  format(messages: Message[]): string[] {
    let lastMsg = null;
    let currentText = "";

    const formattedTexts = messages.reverse().reduce((combined, msg) => {
      const { from, text } = msg;

      if (lastMsg && msg.from && lastMsg.from.id === msg.from.id) {
        currentText += ` ${text}.`;
      } else {
        currentText += `${from.first_name} sanoo. ${text}.`;
      }
      lastMsg = msg;

      if (currentText.length > this.maxLen) {
        const [fullText, restText] = this._splitIfTooLong(currentText);
        combined.push(fullText);
        currentText = restText;
      }

      return combined;
    }, []);

    if (currentText.length > 0) {
      formattedTexts.push(currentText);
    }

    return formattedTexts;
  }

  private _splitIfTooLong(text: string) {
    const splitIdx =
      Math.max(
        text.lastIndexOf(" ", this.maxLen),
        text.lastIndexOf(".", this.maxLen),
        text.lastIndexOf(",", this.maxLen)
      ) + 1;

    const fullText = text.substring(0, splitIdx);
    const restText = text.substring(splitIdx);

    return [fullText, restText];
  }
}
