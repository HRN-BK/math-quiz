// src/utils/sounds.ts

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playClickSound = () => {
  try {
    initAudio();
    playTone(400, 'sine', 0.1, 0.05);
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playCorrectSound = () => {
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // C5 -> E5 -> G5 (Happy ascending chord)
    const playNote = (freq: number, delay: number) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gain.gain.setValueAtTime(0.1, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    };

    playNote(523.25, 0);    // C5
    playNote(659.25, 0.1);  // E5
    playNote(783.99, 0.2);  // G5
    playNote(1046.50, 0.3); // C6
  } catch (e) {
    console.error("Audio error", e);
  }
};

export const playWrongSound = () => {
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Slide down (sad sound)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.error("Audio error", e);
  }
};
