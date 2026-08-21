import React, { useState, useRef, useEffect } from 'react';
import { Truck, Box, RefreshCw, LayoutDashboard, Sparkles, Languages, Globe, Check } from 'lucide-react';
import { useSaathiStore } from '../store/useSaathiStore';
import { useLanguageStore, INDIAN_LANGUAGES } from '../store/languageStore';

export const Header: React.FC = () => {
  const { activeRole, setActiveRole, resetScenario, isLoading, isOptimizing } = useSaathiStore();
  const { currentLanguage, setLanguage, isBilingualMode, toggleBilingualMode, t, bilingual } = useLanguageStore();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLangObj = INDIAN_LANGUAGES.find(l => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  LastMileSaathi
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Route Matrix
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBilingualMode && currentLanguage !== 'en' ? (
                  <span>{bilingual('appTagline').primary} • {bilingual('appTagline').secondary}</span>
                ) : (
                  <span>{t('appTagline')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation / Role Switcher Tabs */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveRole('dispatcher')}
              className={`flex flex-col items-center px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'dispatcher'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{bilingual('dispatcherNav').primary}</span>
              </div>
              {isBilingualMode && currentLanguage !== 'en' && (
                <span className="text-[9px] opacity-80">{bilingual('dispatcherNav').secondary}</span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('shipper')}
              className={`flex flex-col items-center px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'shipper'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <Box className="w-3.5 h-3.5" />
                <span>{bilingual('shipperNav').primary}</span>
              </div>
              {isBilingualMode && currentLanguage !== 'en' && (
                <span className="text-[9px] opacity-80">{bilingual('shipperNav').secondary}</span>
              )}
            </button>

            <button
              onClick={() => setActiveRole('driver')}
              className={`flex flex-col items-center px-3.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'driver'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>{bilingual('driverNav').primary}</span>
              </div>
              {isBilingualMode && currentLanguage !== 'en' && (
                <span className="text-[9px] opacity-80">{bilingual('driverNav').secondary}</span>
              )}
            </button>
          </div>

          {/* Right Controls: 22 Languages Dropdown + Bilingual Toggle + Reset */}
          <div className="flex items-center space-x-2.5">
            {/* Bilingual Mode Toggle Button */}
            <button
              onClick={toggleBilingualMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                isBilingualMode 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Bilingual Dual-Language Subtitles"
            >
              <span className="text-[11px]">{currentLanguage === 'en' ? 'Bilingual Mode' : 'द्विभाषी / Bilingual'}</span>
            </button>

            {/* 22 Official Indian Languages Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
              >
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{selectedLangObj.nativeName}</span>
                {selectedLangObj.code !== 'en' && (
                  <span className="text-[10px] text-slate-400">({selectedLangObj.name})</span>
                )}
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Select Language</span>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    {INDIAN_LANGUAGES.map((lang) => {
                      const isSelected = lang.code === currentLanguage;
                      return (
                        <button
                          key={`lang-${lang.code}`}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center justify-between text-left transition ${
                            isSelected ? 'bg-emerald-950/40 text-emerald-400 font-bold' : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-white font-medium">{lang.nativeName}</div>
                            <div className="text-[10px] text-slate-500">{lang.name} • {lang.region}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Demo Seed Button */}
            <button
              onClick={() => resetScenario()}
              disabled={isLoading || isOptimizing}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition disabled:opacity-50"
              title="Reseed standard demo scenario"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{currentLanguage === 'en' ? 'Reset Demo' : 'रीसेट / Reset'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
