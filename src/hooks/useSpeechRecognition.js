import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (onFinalTranscript) => {
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const interimTimeoutRef = useRef(null);
  
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // 重複起動防止
            }
          }
        }, 200);
      }
    };

    recognition.onresult = (event) => {
      let interim = '';
      let hasFinal = false;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          const finalSpeech = result[0].transcript.trim();
          if (finalSpeech && onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(finalSpeech);
            hasFinal = true;
          }
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      // 【重要】ブラウザの確定（isFinal）が不安定な環境に対応するためのタイムアウト確定処理
      if (interim.trim() && !hasFinal) {
        if (interimTimeoutRef.current) {
          clearTimeout(interimTimeoutRef.current);
        }

        // 話し終えてから1.3秒間変化がなければ、強制的に確定扱いにして3D落下させる
        interimTimeoutRef.current = setTimeout(() => {
          const textToFinalize = interim.trim();
          if (textToFinalize && onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(textToFinalize);
          }
          setInterimTranscript('');
          
          // 音声認識を一度stopして再起動させ、バッファを強制クリア
          try {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          } catch (e) {}
        }, 1300);
      } else if (hasFinal) {
        // すでに正式に確定した場合はタイマークリア
        if (interimTimeoutRef.current) {
          clearTimeout(interimTimeoutRef.current);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (interimTimeoutRef.current) {
        clearTimeout(interimTimeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition already started or error occurred:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = false;
    if (interimTimeoutRef.current) {
      clearTimeout(interimTimeoutRef.current);
    }
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('Recognition already stopped:', e);
    }
    setListening(false);
    setInterimTranscript('');
  }, []);

  return {
    listening,
    interimTranscript,
    error,
    startListening,
    stopListening
  };
};
