// 単一のAudioContextを再利用
let audioContext = null;
let isPlaying = false;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  
  // サスペンド状態の場合は再開
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

// クリック音を再生する関数
export const playClickSound = () => {
  // 既に再生中なら新しい音を再生しない（連続クリック対策）
  if (isPlaying) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    isPlaying = true;
    
    // ホワイトノイズバッファを作成
    const bufferSize = ctx.sampleRate * 0.01; // 10ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // ホワイトノイズを生成
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }
    
    // バッファソースとゲインノードを作成
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // ハイパスフィルターでクリック感を強調
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    // 超短いエンベロープ
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.003);
    
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + 0.01);
    
    // 再生終了後にフラグをリセット
    source.onended = () => {
      isPlaying = false;
      // ノードの接続を解除してメモリを解放
      source.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };
  } catch (error) {
    console.warn('Audio playback failed:', error);
    isPlaying = false;
  }
};