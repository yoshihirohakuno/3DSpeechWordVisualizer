import { useState, useEffect, useRef } from 'react';

export const useWordTokenizer = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const tokenizerRef = useRef(null);

  useEffect(() => {
    const initTokenizer = () => {
      const k = window.kuromoji;
      if (!k) {
        setTimeout(initTokenizer, 100);
        return;
      }

      k.builder({ dicPath: '/dict/' }).build((err, tokenizer) => {
        if (err) {
          console.error('Failed to load Kuromoji dictionary:', err);
          setError('辞書ファイルの読み込みに失敗しました。');
          return;
        }
        tokenizerRef.current = tokenizer;
        setReady(true);
        console.log('Kuromoji tokenizer is ready!');
      });
    };

    initTokenizer();
  }, []);

  const tokenize = (text, options = {}) => {
    if (!ready || !tokenizerRef.current) {
      console.warn('Tokenizer is not ready yet.');
      return [];
    }

    const {
      excludeParticles = true,
      excludeAuxiliaryVerbs = true,
      excludeSymbols = true,
      excludeConjunctions = false,
      excludeAdverbs = false,
      useBasicForm = false
    } = options;

    const tokens = tokenizerRef.current.tokenize(text);
    
    return tokens
      .map(token => {
        const pos = token.pos;
        const word = useBasicForm && token.basic_form !== '*' ? token.basic_form : token.surface_form;
        
        return {
          word,
          pos,
          reading: token.reading,
          token
        };
      })
      .filter(item => {
        const word = item.word.trim();
        if (!word) return false;

        const pos = item.pos;

        if (excludeParticles && pos === '助詞') return false;
        if (excludeAuxiliaryVerbs && pos === '助動詞') return false;
        if (excludeSymbols && pos === '記号') return false;
        if (excludeConjunctions && pos === '接続詞') return false;
        if (excludeAdverbs && pos === '副詞') return false;

        if (excludeSymbols && /^[、。！？\-\(\)\[\]\{\}「」『』\s]+$/.test(word)) return false;

        return true;
      });
  };

  return { ready, error, tokenize };
};
