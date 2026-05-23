import api from "./axios";
import { isDemoMode } from "../store/demoStore";
import { TEXT_RESPONSES } from "./mockData";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const findMockAnswer = (question) => {
  const q = question.toLowerCase();
  for (const item of TEXT_RESPONSES) {
    if (item.keywords.some((kw) => q.includes(kw))) return item.answer;
  }
  return "Bu savol bo'yicha HR bo'limiga murojaat qilishingizni tavsiya qilaman. Aloqa: hr@turonbank.uz yoki +998 71 200-00-00.";
};

export const askChatbot = async (question) => {
  if (isDemoMode()) {
    await sleep(1300);
    return { data: { answer: findMockAnswer(question) } };
  }
  return api.post("/chatbot/ask/", { question });
};

export const getChatHistory = () => {
  if (isDemoMode()) return Promise.resolve({ data: [] });
  return api.get("/chatbot/history/");
};
