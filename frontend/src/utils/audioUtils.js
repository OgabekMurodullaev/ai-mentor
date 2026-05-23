/**
 * AudioBuffer → WAV Blob (PCM 16-bit, mono)
 * AISHA AI STT audio/wav format talab qiladi
 */
function audioBufferToWav(buffer) {
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;

  // Stereo → Mono mix
  let samples;
  if (buffer.numberOfChannels === 1) {
    samples = buffer.getChannelData(0);
  } else {
    samples = new Float32Array(length);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const ch_data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        samples[i] += ch_data[i] / buffer.numberOfChannels;
      }
    }
  }

  // Float32 → Int16 PCM
  const pcm = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768)));
  }

  // WAV header + data
  const wavBuffer = new ArrayBuffer(44 + pcm.byteLength);
  const view = new DataView(wavBuffer);

  const str = (offset, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  str(0,  "RIFF");
  view.setUint32(4,  36 + pcm.byteLength,  true);
  str(8,  "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16,            true);  // chunk size
  view.setUint16(20, 1,             true);  // PCM
  view.setUint16(22, 1,             true);  // mono
  view.setUint32(24, sampleRate,    true);  // sample rate
  view.setUint32(28, sampleRate * 2, true); // byte rate (16-bit mono)
  view.setUint16(32, 2,             true);  // block align
  view.setUint16(34, 16,            true);  // bits per sample
  str(36, "data");
  view.setUint32(40, pcm.byteLength, true);
  new Int16Array(wavBuffer, 44).set(pcm);

  return new Blob([wavBuffer], { type: "audio/wav" });
}

/**
 * Brauzer yozgan WebM/OGG → WAV Blob
 * Web Audio API orqali decode → PCM WAV sifatida qayta yoziladi.
 * AISHA AI STT faqat WAV qabul qiladi — bu konvertatsiya uni to'g'ri ishlashini ta'minlaydi.
 *
 * @param {Blob} audioBlob  - MediaRecorder'dan kelgan raw audio
 * @returns {{ blob: Blob, ext: string }}
 */
export async function convertToWav(audioBlob) {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();
    const wavBlob = audioBufferToWav(decoded);
    return { blob: wavBlob, ext: "wav" };
  } catch (err) {
    console.warn("[audioUtils] WAV konversiya xato, original format ishlatilmoqda:", err);
    const type = audioBlob.type || "";
    const ext = type.includes("ogg") ? "ogg" : type.includes("mp4") ? "mp4" : "webm";
    return { blob: audioBlob, ext };
  }
}
