import api from "./axios";
import { DEMO_MODE, DEMO_DELAY_MS } from "../config/demoMode";
import { TEXT_RESPONSES } from "./mockData";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Savol matni bo'yicha eng mos mock javobni topadi */
const findMockAnswer = (question) => {
  const q = question.toLowerCase();
  for (const item of TEXT_RESPONSES) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.answer;
    }
  }
  // Hech narsa topilmasa — umumiy javob
  return "Bu savol bo'yicha HR bo'limiga murojaat qilishingizni tavsiya qilaman. Aloqa: hr@turonbank.uz yoki +998 71 200-00-00.";
};

export const askChatbot = async (question) => {
  if (DEMO_MODE) {
    await sleep(DEMO_DELAY_MS);
    return { data: { answer: findMockAnswer(question) } };
  }
  return api.post("/chatbot/ask/", { question });
};

export const getChatHistory = () => {
  if (DEMO_MODE) return Promise.resolve({ data: [] });
  return api.get("/chatbot/history/");
};
