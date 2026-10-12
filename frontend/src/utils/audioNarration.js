let currentAudio = null;

export async function playOutdoorNarration(text, apiBase = '', onStateChange = null) {
  // Stop any currently playing audio or speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (onStateChange) onStateChange({ isPlaying: true, engine: 'connecting' });

  try {
    const res = await fetch(`${apiBase}/api/voice/narrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('audio')) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      currentAudio = new Audio(audioUrl);

      if (onStateChange) onStateChange({ isPlaying: true, engine: 'elevenlabs' });

      currentAudio.onended = () => {
        currentAudio = null;
        if (onStateChange) onStateChange({ isPlaying: false, engine: null });
      };

      currentAudio.onerror = () => {
        fallbackBrowserTTS(text, onStateChange);
      };

      await currentAudio.play();
      return;
    }
  } catch (err) {
    console.warn('ElevenLabs API request failed, falling back to browser TTS:', err);
  }

  // Graceful fallback to browser speech synthesis
  fallbackBrowserTTS(text, onStateChange);
}

function fallbackBrowserTTS(text, onStateChange) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onStateChange) onStateChange({ isPlaying: false, engine: null });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Slightly slower, relaxing pace for outdoors
  utterance.pitch = 1.0;

  if (onStateChange) onStateChange({ isPlaying: true, engine: 'browser_tts' });

  utterance.onend = () => {
    if (onStateChange) onStateChange({ isPlaying: false, engine: null });
  };
  utterance.onerror = () => {
    if (onStateChange) onStateChange({ isPlaying: false, engine: null });
  };

  window.speechSynthesis.speak(utterance);
}

export function stopOutdoorNarration(onStateChange = null) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (onStateChange) onStateChange({ isPlaying: false, engine: null });
}
