import React, { useState, useEffect, useRef } from 'react';
import { Settings, Play, Square, RotateCcw, User, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export const ControlPanel = ({
  listening,
  onStartListening,
  onStopListening,
  onReset,
  settings,
  onUpdateSettings,
  currentSpeaker,
  onChangeSpeaker,
  onSpawnTestWord
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const panelRef = useRef(null);

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
        x: -320,
        opacity: 0.85,
        duration: 0.4,
        ease: 'power3.inOut'
      });
    }
  }, [isOpen]);

  const handleSliderChange = (key, value) => {
    onUpdateSettings({ [key]: value });
  };

  const handleCheckboxChange = (key, checked) => {
    onUpdateSettings({ [key]: checked });
  };

  return (
    <div className="control-panel-wrapper">
      <div 
        ref={panelRef}
        className={`control-panel glass ${settings.colorTheme === 'neon' ? 'neon-border' : ''}`}
      >
        <div className="panel-header">
          <Settings className="icon spin-hover" />
          <h2>コントロール設定</h2>
        </div>

        <div className="panel-section">
          <h3>音声認識</h3>
          <div className="button-group">
            {!listening ? (
              <button className="btn btn-primary btn-start" onClick={onStartListening}>
                <Play className="btn-icon" size={16} />
                認識開始
              </button>
            ) : (
              <button className="btn btn-danger btn-stop" onClick={onStopListening}>
                <Square className="btn-icon" size={16} />
                認識停止
              </button>
            )}
            <button className="btn btn-secondary btn-reset" onClick={onReset}>
              <RotateCcw className="btn-icon" size={16} />
              リセット
            </button>
          </div>
          {listening && (
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              <span className="status-text">マイク入力中...</span>
            </div>
          )}
          
          {/* デバッグ用のテスト単語落下ボタン */}
          <button 
            className="btn btn-secondary" 
            onClick={onSpawnTestWord}
            style={{ marginTop: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}
          >
            <Sparkles size={14} className="icon" style={{ marginRight: '6px' }} />
            テスト文字を落とす
          </button>
        </div>

        <div className="panel-section">
          <h3>話者選択 (発言者の色)</h3>
          <div className="speaker-selector">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                className={`speaker-btn speaker-${num} ${currentSpeaker === num ? 'active' : ''}`}
                onClick={() => onChangeSpeaker(num)}
              >
                <User className="btn-icon-s" size={12} />
                話者 {num + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-section">
          <h3>3D物理パラメータ</h3>
          
          <div className="slider-group">
            <div className="slider-label">
              <span>文字サイズ</span>
              <span>x{settings.fontSize.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.5" max="2.0" step="0.1" 
              value={settings.fontSize} 
              onChange={(e) => handleSliderChange('fontSize', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>跳ね返り</span>
              <span>{settings.bounciness.toFixed(1)}</span>
            </div>
            <input 
              type="range" min="0.0" max="1.0" step="0.1" 
              value={settings.bounciness} 
              onChange={(e) => handleSliderChange('bounciness', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>重力の強さ</span>
              <span>{Math.abs(settings.gravity).toFixed(1)}</span>
            </div>
            <input 
              type="range" min="-20.0" max="-2.0" step="0.5" 
              value={settings.gravity} 
              onChange={(e) => handleSliderChange('gravity', parseFloat(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>最大表示数</span>
              <span>{settings.maxWords}</span>
            </div>
            <input 
              type="range" min="10" max="100" step="5" 
              value={settings.maxWords} 
              onChange={(e) => handleSliderChange('maxWords', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="panel-section">
          <h3>除外する品詞</h3>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.excludeParticles} 
                onChange={(e) => handleCheckboxChange('excludeParticles', e.target.checked)}
              />
              助詞 (は, の, に)
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.excludeAuxiliaryVerbs} 
                onChange={(e) => handleCheckboxChange('excludeAuxiliaryVerbs', e.target.checked)}
              />
              助動詞 (です, ます)
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.excludeSymbols} 
                onChange={(e) => handleCheckboxChange('excludeSymbols', e.target.checked)}
              />
              記号 (！, ？, 、)
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={settings.excludeAdverbs} 
                onChange={(e) => handleCheckboxChange('excludeAdverbs', e.target.checked)}
              />
              副詞 (とても, すこし)
            </label>
          </div>
        </div>

        <div className="panel-section">
          <h3>デザインテーマ</h3>
          <select 
            value={settings.colorTheme} 
            onChange={(e) => handleSliderChange('colorTheme', e.target.value)}
            className="theme-select"
          >
            <option value="pastel">パステルカラー (品詞別)</option>
            <option value="neon">サイバーネオン (品詞別)</option>
            <option value="speaker">話者カラー (話者別)</option>
          </select>
        </div>
      </div>

      <button 
        className="panel-toggle glass" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ left: isOpen ? '310px' : '10px' }}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
};
