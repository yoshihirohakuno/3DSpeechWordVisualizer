import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export const WordLog = ({
  interimTranscript,
  speechLog,
  activeWordsCount,
  wordFrequencies,
  colorTheme
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const panelRef = useRef(null);
  const logListRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(panelRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out'
      });
    } else {
      gsap.to(panelRef.current, {
        x: 320,
        opacity: 0.85,
        duration: 0.4,
        ease: 'power3.inOut'
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
      
      const lastChild = logListRef.current.lastElementChild;
      if (lastChild) {
        gsap.fromTo(lastChild, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }
    }
  }, [speechLog]);

  const sortedFrequencies = Object.entries(wordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="word-log-wrapper">
      <button 
        className="panel-toggle-right glass" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ right: isOpen ? '310px' : '10px' }}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div 
        ref={panelRef}
        className={`word-log-panel glass ${colorTheme === 'neon' ? 'neon-border' : ''}`}
      >
        <div className="panel-header">
          <MessageSquare className="icon" />
          <h2>会話ログ & 統計</h2>
        </div>

        <div className="panel-section">
          <h3>リアルタイム認識</h3>
          <div className="interim-box">
            {interimTranscript ? (
              <p className="interim-text">{interimTranscript}</p>
            ) : (
              <p className="interim-placeholder">話しかけるとここにリアルタイムで表示されます...</p>
            )}
          </div>
        </div>

        <div className="panel-section stats-row">
          <div className="stat-card glass">
            <span className="stat-label">3D単語数</span>
            <span className="stat-value">{activeWordsCount}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">発話数</span>
            <span className="stat-value">{speechLog.length}</span>
          </div>
        </div>

        <div className="panel-section log-section">
          <h3>発話ログ</h3>
          <div className="log-list" ref={logListRef}>
            {speechLog.length === 0 ? (
              <p className="log-placeholder">確定した文章がここに記録されます</p>
            ) : (
              speechLog.map((log) => (
                <div key={log.id} className="log-item">
                  <span className={`log-speaker speaker-text-${log.speakerId}`}>
                    話者 {log.speakerId + 1}:
                  </span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel-section">
          <div className="section-title">
            <TrendingUp size={16} className="icon" />
            <h3>頻出単語 (TOP 5)</h3>
          </div>
          <div className="frequency-list">
            {sortedFrequencies.length === 0 ? (
              <p className="log-placeholder">単語がまだありません</p>
            ) : (
              sortedFrequencies.map(([word, count], idx) => (
                <div key={word} className="frequency-item">
                  <span className="freq-rank">{idx + 1}</span>
                  <span className="freq-word">{word}</span>
                  <div className="freq-bar-wrapper">
                    <div 
                      className="freq-bar" 
                      style={{ 
                        width: `${Math.min(100, (count / sortedFrequencies[0][1]) * 100)}%`,
                        background: colorTheme === 'neon' 
                          ? 'linear-gradient(90deg, #00f0ff, #ff007f)' 
                          : 'linear-gradient(90deg, #3b82f6, #ec4899)'
                      }}
                    ></div>
                  </div>
                  <span className="freq-count">{count}回</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
