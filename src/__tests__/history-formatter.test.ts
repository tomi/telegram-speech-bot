import { Message, User } from "node-telegram-bot-api";
import HistoryFormatter from "../history-formatter";

const userA = {
  id: 1,
  is_bot: false,
  first_name: "firstnameA",
  last_name: "lastnameA"
};
const userB = {
  id: 2,
  is_bot: false,
  first_name: "firstnameB",
  last_name: "lastnameB"
};

const msg = (overrides): Message => ({
  ...{
    message_id: 1,
    date: Date.now(),
    chat: {}
  },
  ...overrides
});

const textMsg = (from: User, text: string) => msg({ from, text });

describe("history-formatter", () => {
  describe("formatHistory", () => {
    test("it combines messages from the same user", () => {
      const formatter = new HistoryFormatter(1024);

      expect(
        formatter.format([
          textMsg(userA, "First message"),
          textMsg(userA, "Second message")
        ])
      ).toEqual([`${userA.first_name} sanoo. Second message. First message.`]);
    });

    test("it splits too long texts", () => {
      const formatter = new HistoryFormatter(20);

      expect(
        formatter.format([
          textMsg(userA, "First message"),
          textMsg(userA, "Second message")
        ])
      ).toEqual([`firstnameA sanoo. `, `Second message. `, `First message.`]);
    });
  });
});
