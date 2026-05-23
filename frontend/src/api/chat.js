import api from "./axios";

export const askChatbot = (question) =>
  api.post("/chatbot/ask/", { question });

export const getChatHistory = () =>
  api.get("/chatbot/history/");
