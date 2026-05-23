import api from "./axios";
import { isDemoMode } from "../store/demoStore";
import { SIMULATOR_SCENARIOS } from "./mockData";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const getScenarios = async () => {
  if (isDemoMode()) {
    await sleep(600);
    return { data: SIMULATOR_SCENARIOS };
  }
  return api.get("/simulator/scenarios/");
};

export const startScenario = async (id) => {
  if (isDemoMode()) {
    await sleep(400);
    const s = SIMULATOR_SCENARIOS.find((x) => x.id === id) || SIMULATOR_SCENARIOS[0];
    return { data: { ...s, scenario_id: s.id } };
  }
  return api.post("/simulator/start/", { scenario_id: id });
};

export const submitAnswer = (data) => api.post("/simulator/submit/", data);

export const finishScenario = async (data) => {
  if (isDemoMode()) {
    await sleep(300);
    return { data: { success: true } };
  }
  return api.post("/simulator/finish/", data);
};

export const getDifficultClientResponse = async (data) => {
  if (isDemoMode()) {
    await sleep(800);
    return { data: { client_text: "Tushundim, rahmat.", audio_url: null } };
  }
  return api.post("/simulator/difficult-client/", data);
};
