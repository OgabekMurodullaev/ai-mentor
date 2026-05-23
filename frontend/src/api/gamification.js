import api from "./axios";

export const getProgress = () => api.get("/gamification/progress/");
export const getLeaderboard = () => api.get("/gamification/leaderboard/");
export const getBadges = () => api.get("/gamification/badges/");
