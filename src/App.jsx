import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useWordTokenizer } from './hooks/useWordTokenizer';
import { Scene } from './components/Scene';
import { ControlPanel } from './components/ControlPanel';
import { WordLog } from './components/WordLog';
import './styles/app.css';

export default function App() {
  const [words, setWords] = useState([]);
  const [speechLog, setSpeechLog] = useState([]);
  const [wordFrequencies, setWordFrequencies] = useState({});
  const [currentSpeaker, setCurrentSpeaker] = useState(0);

  const [settings, setSettings] = useState({
    fontSize: 1.0,
    bounciness: 0.15,
    gravity: -9.8,
    maxWords: 35,
    excludeParticles: true,
    excludeAuxiliaryVerbs: true,
    excludeSymbols: true,
    excludeAdverbs: false,
    colorTheme: 'pastel'
  });

  const { ready: tokenizerReady, tokenize } = useWordTokenizer();

  const handleFinalTranscript = useCallback((text) => {
    if (!tokenizerReady) return;

    const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setSpeechLog((prev) => [...prev, { id: logId, text, speakerId: currentSpeaker }]);

    const tokens = tokenize(text, {
      excludeParticles: settings.excludeParticles,
      excludeAuxiliaryVerbs: settings.excludeAuxiliaryVerbs,
      excludeSymbols: settings.excludeSymbols,
      excludeAdverbs: settings.excludeAdverbs
    });

    if (tokens.length === 0) return;

    const newWords = tokens.map((t, idx) => {
      setWordFrequencies((prev) => {
        const count = prev[t.word] || 0;
        return { ...prev, [t.word]: count + 1 };
      });

      return {
        id: Date.now().toString() + '-' + idx + '-' + Math.random().toString(36).substr(2, 5),
        word: t.word,
        pos: t.pos,
        speakerId: currentSpeaker,
        initialPos: [
          (Math.random() - 0.5) * 5.0, 
          7.5 + idx * 0.45,             
          (Math.random() - 0.5) * 0.3  
        ]
      };
    });

    setWords((prev) => {
      const combined = [...prev, ...newWords];
      if (combined.length > settings.maxWords) {
        return combined.slice(combined.length - settings.maxWords);
      }
      return combined;
    });
  }, [tokenizerReady, tokenize, settings, currentSpeaker]);

  // デバッグ用の強制単語落下処理
  const handleSpawnTestWord = useCallback(() => {
    const testList = ['こんにちは', '3D可視化', '音声認識', '物理演算', '楽しい', '未来', '言葉', '降ってくる'];
    const randomWord = testList[Math.floor(Math.random() * testList.length)];
    
    // 品詞をランダムに設定して色を分ける
    const poses = ['名詞', '動詞', '形容詞', '副詞'];
    const randomPos = poses[Math.floor(Math.random() * poses.length)];

    setWordFrequencies((prev) => {
      const count = prev[randomWord] || 0;
      return { ...prev, [randomWord]: count + 1 };
    });

    const newWord = {
      id: 'test-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
      word: randomWord,
      pos: randomPos,
      speakerId: currentSpeaker,
      initialPos: [
        (Math.random() - 0.5) * 4.0, 
        8.0,             
        (Math.random() - 0.5) * 0.2  
      ]
    };

    setWords((prev) => {
      const combined = [...prev, newWord];
      if (combined.length > settings.maxWords) {
        return combined.slice(combined.length - settings.maxWords);
      }
      return combined;
    });
  }, [settings.maxWords, currentSpeaker]);

  const {
    listening,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening
  } = useSpeechRecognition(handleFinalTranscript);

  const handleDestroyWord = useCallback((id) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleUpdateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleReset = useCallback(() => {
    setWords([]);
    setSpeechLog([]);
    setWordFrequencies({});
  }, []);

  return (
    <div className={`app-container ${settings.colorTheme === 'neon' ? 'theme-dark' : 'theme-light'}`}>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 0.5, 9.5], fov: 48 }}
        >
          <color attach="background" args={[settings.colorTheme === 'neon' ? '#0b0f19' : '#f8fafc']} />
          <Scene
            words={words}
            colorTheme={settings.colorTheme}
            fontSize={settings.fontSize}
            bounciness={settings.bounciness}
            gravity={settings.gravity}
            onDestroyWord={handleDestroyWord}
          />
        </Canvas>
      </div>

      {speechError && (
        <div className="error-banner">
          <p>{speechError}</p>
        </div>
      )}

      <ControlPanel
        listening={listening}
        onStartListening={startListening}
        onStopListening={stopListening}
        onReset={handleReset}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentSpeaker={currentSpeaker}
        onChangeSpeaker={setCurrentSpeaker}
        onSpawnTestWord={handleSpawnTestWord}
      />

      <WordLog
        interimTranscript={interimTranscript}
        speechLog={speechLog}
        activeWordsCount={words.length}
        wordFrequencies={wordFrequencies}
        colorTheme={settings.colorTheme}
      />

      {!listening && speechLog.length === 0 && (
        <div className="intro-overlay glass">
          <h1>会話の3D可視化</h1>
          <p>「認識開始」をクリックして、マイクに向かって日本語で話しかけてください。</p>
          <p className="subtext">話した言葉が品詞に応じた美しい3Dブロックとして落下し、積み上がります。</p>
        </div>
      )}
    </div>
  );
}
