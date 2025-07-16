import { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaMusic } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import songs from "../songs";

export default function KaraokePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [manualScroll, setManualScroll] = useState(false);
  const [showSongList, setShowSongList] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const audioRef = useRef(null);
  const lyricsRef = useRef(null);

  const song = songs[selectedIndex];
  const { title, artist, lyrics, audioUrl } = song || {};

  useEffect(() => {
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !lyrics.length) return;

      const time = audio.currentTime;
      setCurrentTime(time);

      const index = lyrics.findIndex((line, i) => {
        const next = lyrics[i + 1];
        return time >= line.time && (!next || time < next.time);
      });

      if (index !== -1) {
        setCurrentLine(index);
        if (!manualScroll) {
          const lineEl = document.getElementById(`line-${index}`);
          if (lineEl && lyricsRef.current) {
            lyricsRef.current.scrollTo({
              top: lineEl.offsetTop - lyricsRef.current.clientHeight / 2 + 40,
              behavior: "smooth",
            });
          }
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [lyrics, manualScroll]);
  const handleScroll = () => {
    setManualScroll(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setManualScroll(false);
    }, 3000);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleLyricClick = (time, index) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      audio.play();
      setIsPlaying(true);
      setCurrentLine(index);
      setManualScroll(false);
    }
  };

  const handleSelectSong = (index) => {
    setSelectedIndex(index);
    setIsPlaying(false);
    setCurrentLine(0);
    setCurrentTime(0);
    setShowSongList(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-gray-900 text-white p-4 flex items-center justify-center">

      {/* MENU STRIP 3 KIRI ATAS */}
      <div className="fixed top-4 left-2 z-50">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          className="p-2 rounded-md bg-white/90 text-black shadow-lg hover:bg-white/95 transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-2 w-48 bg-white/90 text-black rounded-lg shadow-lg backdrop-blur-md border border-white/50"
            >
              <ul>
                <li>
                  <a
                    href="https://padus-tajurhalang.vercel.app/"
                    className="block w-full text-left px-4 py-2 hover:bg-yellow-300 transition"
                  >
                    Home
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logo pojok kiri atas */}
      <img
        src="/logo.png"
        alt="Logo Padus"
        className="absolute top-4 left-14 w-12 h-12 object-contain z-40"
      />

      {/* Tombol pilih lagu kanan atas */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowSongList(!showSongList)}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
          title="Pilih Lagu"
        >
          <FaMusic size={20} />
        </button>

        {showSongList && (
          <div className="mt-3 bg-white/10 backdrop-blur-md p-4 rounded-xl max-h-80 overflow-y-auto border border-white/20 w-64 shadow-lg">
            <h3 className="text-lg font-bold mb-2 text-white">Daftar Lagu</h3>
            <ul className="space-y-2">
              {songs.map((s, i) => (
                <li
                  key={s.id}
                  onClick={() => handleSelectSong(i)}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition ${
                    selectedIndex === i
                      ? "bg-green-600 text-white"
                      : "hover:bg-white/20 text-white"
                  }`}
                >
                  {s.title} – {s.artist}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Kontainer utama karaoke */}
      <div className="w-full max-w-3xl p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <h2 className="text-lg text-gray-300">{artist}</h2>
        </div>

        <div
          ref={lyricsRef}
          onScroll={handleScroll}
          className="h-[60vh] overflow-y-auto px-4 bg-black/20 border-l-4 border-green-400 rounded-lg mb-6 scroll-smooth"
        >
          {lyrics.map((line, index) => (
            <p
              key={index}
              id={`line-${index}`}
              onClick={() => handleLyricClick(line.time, index)}
              className={`text-xl py-2 text-center cursor-pointer transition-all duration-300 ${
                index === currentLine
                  ? "text-green-400 font-bold text-2xl"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* Kontrol audio */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
          </button>

          <div className="flex flex-col w-full">
            <div className="flex justify-between text-sm text-gray-300 mb-1 px-1">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(audioRef.current?.duration || 0)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={audioRef.current?.duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} />
      </div>
    </div>
  );
}
