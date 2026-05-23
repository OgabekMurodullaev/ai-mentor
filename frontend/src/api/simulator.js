import api from "./axios";

export const getScenarios = () => api.get("/simulator/scenarios/");
export const startScenario = (id) =>
  api.post("/simulator/start/", { scenario_id: id });
export const submitAnswer = (data) =>
  api.post("/simulator/submit/", data);
export const finishScenario = (data) =>
  api.post("/simulator/finish/", data);
export const getDifficultClientResponse = (data) =>
  api.post("/simulator/difficult-client/", data);
