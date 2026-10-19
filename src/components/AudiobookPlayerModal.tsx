import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Clock, 
  ListMusic, 
  Minimize2, 
  Maximize2, 
  Headphones, 
  Zap, 
  ShoppingCart, 
  Check, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types/book';

export const AudiobookPlayerModal: React.FC = () => {
  const {
    playingAudioBook,
    setPlayingAudioBook,
    isAudioPlayerOpen,
    setIsAudioPlayerOpen,
    addToCart,
    setIsCheckoutOpen,
    formatPrice
  } = useStore();

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Default chapter duration in seconds
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);

  // Audio Context Ref for ambient studio sound generator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const book = playingAudioBook;

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSpeechAvailable(true);
    }
  }, []);

  // When book changes, reset chapter and state
  useEffect(() => {
    if (book) {
      setCurrentChapterIdx(0);
      setCurrentTime(0);
      setIsPlaying(true);
      setIsMinimized(false);
      
      // Calculate estimated chapter duration (e.g. 180s - 420s)
      const estimatedSecs = 180 + ((book.title.length * 7) % 240);
      setDuration(estimatedSecs);
    }
  }, [book?.id]);

  // Handle SpeechSynthesis narration
  useEffect(() => {
    if (!book || !isSpeechAvailable) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      const currentChapter = book.tableOfContents[currentChapterIdx];
      const textToRead = `${book.title}. ${currentChapter ? currentChapter.title : 'Chapter 1'}. ${currentChapter?.previewExcerpt || book.sampleExcerpt || book.description}`;
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = playbackRate;
      utterance.volume = isMuted ? 0 : volume;

      // Select high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        // If there's a next chapter, go to next chapter or pause
        if (currentChapterIdx < (book.tableOfContents.length - 1)) {
          setCurrentChapterIdx(prev => prev + 1);
          setCurrentTime(0);
        } else {
          setIsPlaying(false);
        }
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.pause();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [book, currentChapterIdx, isPlaying, playbackRate, isSpeechAvailable]);

  // Update speech synthesis volume/rate when altered
  useEffect(() => {
    if (speechUtteranceRef.current && isSpeechAvailable) {
      if (window.speechSynthesis.speaking) {
        if (!isPlaying) {
          window.speechSynthesis.pause();
        } else {
          window.speechSynthesis.resume();
        }
      }
    }
  }, [isPlaying, isSpeechAvailable]);

  // Timer loop for audio elapsed time & visual progression
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            // Next chapter
            if (book && currentChapterIdx < book.tableOfContents.length - 1) {
              setCurrentChapterIdx(c => c + 1);
              return 0;
            }
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackRate, book, currentChapterIdx]);

  // Sleep timer handler
  useEffect(() => {
    if (sleepTimerMinutes && isPlaying) {
      setSleepTimerRemaining(sleepTimerMinutes * 60);
      timerIntervalRef.current = setInterval(() => {
        setSleepTimerRemaining(prev => {
          if (prev === null || prev <= 1) {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
            setSleepTimerMinutes(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setSleepTimerRemaining(null);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sleepTimerMinutes, isPlaying]);

  if (!book || !isAudioPlayerOpen) return null;

  const currentChapter = book.tableOfContents[currentChapterIdx] || {
    chapterNumber: 1,
    title: 'Chapter 1: The Foundation',
    previewExcerpt: book.sampleExcerpt || book.description
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  const handleSkipBack = () => {
    setCurrentTime(prev => Math.max(0, prev - 15));
  };

  const handleSkipForward = () => {
    setCurrentTime(prev => Math.min(duration, prev + 30));
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(prev => prev - 1);
      setCurrentTime(0);
    }
  };

  const handleNextChapter = () => {
    if (book && currentChapterIdx < book.tableOfContents.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
      setCurrentTime(0);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(book, 'Audiobook', 1);
    setIsAudioPlayerOpen(false);
    setIsCheckoutOpen(true);
  };

  // FLOATING MINIMIZED PLAYER (Docked Bottom Right / Bottom Bar)
  if (isMinimized) {
    return (
      <aside 
        aria-label="Floating Audiobook Mini Player" 
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom duration-200"
      >
        <div className="p-3 rounded-xl bg-slate-950/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          {/* Cover & Title */}
          <div 
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
          >
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-11 h-11 object-cover rounded-md border border-white/20 shadow-sm flex-none"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-ping" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audiobook</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{book.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">Ch. {currentChapter.chapterNumber}: {currentChapter.title}</p>
            </div>
          </div>

          {/* Quick Play Controls */}
          <div className="flex items-center gap-1.5 flex-none">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-[#e50914] hover:bg-[#f40612] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              aria-label="Expand player"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Expand player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                window.speechSynthesis.cancel();
                setIsAudioPlayerOpen(false);
              }}
              aria-label="Close player"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // EXPANDED THEATER AUDIOBOOK PLAYER MODAL
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Audiobook Player"
    >
      <div 
        className="relative w-full max-w-3xl my-auto rounded-2xl bg-[#090f1d] border border-slate-700/80 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Liquid Edge Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e50914] via-[#1e90ff] to-[#00a859]" />

        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914]">
                  Official Studio Audiobook
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-400">
                  {book.audioSampleDuration || 'High Fidelity Narration'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {book.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize player to bottom bar"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Minimize to bottom bar"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                window.speechSynthesis.cancel();
                setIsAudioPlayerOpen(false);
              }}
              aria-label="Close audiobook player"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Book Cover & Liquid Waveform Display */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <div className="relative group w-44 sm:w-52 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Badge */}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-black bg-[#e50914] text-white shadow-md">
                AUDIOBOOK
              </span>

              {/* Pulsing visualizer circle overlay */}
              {isPlaying && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15">
                  <span className="w-1 h-3 bg-[#e50914] animate-pulse rounded-full" />
                  <span className="w-1 h-6 bg-[#1e90ff] animate-bounce rounded-full" />
                  <span className="w-1 h-4 bg-[#00a859] animate-pulse rounded-full" />
                  <span className="w-1 h-7 bg-[#e50914] animate-bounce rounded-full" />
                  <span className="w-1 h-3 bg-[#1e90ff] animate-pulse rounded-full" />
                  <span className="text-[10px] font-bold text-white ml-1.5">Studio Audio</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium">By {book.author}</p>
              <p className="text-xs text-slate-500 mt-0.5">{book.publisher} • {book.publishedYear}</p>
            </div>
          </div>

          {/* Right: Chapter Info, Narration Text & Controls */}
          <div className="md:col-span-7 flex flex-col justify-between h-full space-y-5">
            {/* Chapter Header */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
                  Chapter {currentChapter.chapterNumber} of {book.tableOfContents.length}
                </span>
                <button
                  onClick={() => setIsChapterListOpen(!isChapterListOpen)}
                  className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                >
                  <ListMusic className="w-3.5 h-3.5 text-[#1e90ff]" />
                  <span>Chapters</span>
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white line-clamp-1">
                {currentChapter.title}
              </h2>
            </div>

            {/* Read-Along Synced Excerpt Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 max-h-36 sm:max-h-40 overflow-y-auto space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans mb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#1e90ff]" />
                <span>Spoken Excerpt Read-Along:</span>
              </div>
              <p className="italic text-slate-300">
                "{currentChapter.previewExcerpt || book.sampleExcerpt || book.description}"
              </p>
            </div>

            {/* Scrub Bar / Timeline */}
            <div className="space-y-1.5">
              <div className="relative flex items-center">
                <input 
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek audio timeline"
                  className="w-full h-2 rounded-lg bg-slate-800 accent-[#e50914] cursor-pointer focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-400">
                <span>{formatSeconds(currentTime)}</span>
                <span>-{formatSeconds(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Main Center Audio Control Buttons */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 pt-1">
              {/* Prev Chapter */}
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIdx === 0}
                aria-label="Previous chapter"
                className="p-2 rounded-full text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Chapter"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Rewind 15s */}
              <button
                onClick={handleSkipBack}
                aria-label="Rewind 15 seconds"
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 15s"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">15</span>
              </button>

              {/* Primary Play/Pause Button (Red Pill/Circle) */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause audiobook' : 'Play audiobook'}
                className="w-14 h-14 rounded-full bg-[#e50914] hover:bg-[#f40612] text-white flex items-center justify-center shadow-xl shadow-[#e50914]/30 transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-1" />
                )}
              </button>

              {/* Fast Forward 30s */}
              <button
                onClick={handleSkipForward}
                aria-label="Fast forward 30 seconds"
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 30s"
              >
                <RotateCw className="w-5 h-5" />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-0.5">30</span>
              </button>

              {/* Next Chapter */}
              <button
                onClick={handleNextChapter}
                disabled={currentChapterIdx >= (book.tableOfContents.length - 1)}
                aria-label="Next chapter"
                className="p-2 rounded-full text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Chapter"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Accessories: Speed, Sleep Timer, Volume */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Playback Speed selector */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      playbackRate === rate 
                        ? 'bg-[#1e90ff] text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Sleep Timer Selector */}
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={sleepTimerMinutes || ''} 
                  onChange={(e) => setSleepTimerMinutes(e.target.value ? Number(e.target.value) : null)}
                  aria-label="Set sleep timer"
                  className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white cursor-pointer focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Timer: Off</option>
                  <option value="5" className="bg-slate-900 text-white">5 minutes</option>
                  <option value="15" className="bg-slate-900 text-white">15 minutes</option>
                  <option value="30" className="bg-slate-900 text-white">30 minutes</option>
                  <option value="45" className="bg-slate-900 text-white">45 minutes</option>
                </select>
                {sleepTimerRemaining && (
                  <span className="text-[11px] font-mono text-[#00a859] font-bold">
                    {formatSeconds(sleepTimerRemaining)}
                  </span>
                )}
              </div>

              {/* Volume Controller */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-[#ef4444]" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  aria-label="Adjust volume"
                  className="w-16 h-1.5 bg-slate-800 rounded-lg accent-[#1e90ff] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chapter List Overlay Drawer (Slide-down if toggled) */}
        {isChapterListOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 p-4 max-h-60 overflow-y-auto space-y-2 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-slate-300">
              <span>All Chapters ({book.tableOfContents.length})</span>
              <button 
                onClick={() => setIsChapterListOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-1.5">
              {book.tableOfContents.map((ch, idx) => (
                <div
                  key={ch.chapterNumber}
                  onClick={() => {
                    setCurrentChapterIdx(idx);
                    setCurrentTime(0);
                    setIsChapterListOpen(false);
                  }}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    currentChapterIdx === idx
                      ? 'bg-[#1e90ff]/20 border-[#1e90ff] text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px]">
                      {ch.chapterNumber}
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>
                  {currentChapterIdx === idx && (
                    <span className="text-[10px] font-bold text-[#1e90ff] px-1.5 py-0.5 rounded bg-[#1e90ff]/20 flex-none">
                      Playing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Purchase Bar: Buy Audiobook via M-Pesa */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Enjoying this audio preview?</span>
            <span className="font-extrabold text-white text-sm">
              Own Full Audiobook for {formatPrice(book.priceKes)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(book, 'Audiobook', 1)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#1e90ff]" />
              <span>Add Audiobook to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#f40612] text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#e50914]/25 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy with M-Pesa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
