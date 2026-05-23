import api from "./axios";

export const sendSTT = (audioBlob) => {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.wav");
  return api.post("/voice/stt/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const sendTTS = (text, voiceType = "mentor") =>
  api.post("/voice/tts/", { text, voice_type: voiceType });

export const sendVoiceChat = (audioBlob, voiceType = "mentor", ext = "webm") => {
  const form = new FormData();
  form.append("audio", audioBlob, `recording.${ext}`);
  form.append("voice_type", voiceType);
  return api.post("/voice/voice-chat/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
