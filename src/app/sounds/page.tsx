"use client";

import { useEffect, useRef, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Sound {
  id: string;
  name: string;
  emoji: string;
}

const SOUNDS: Sound[] = [
  { id: "white", name: "White Noise", emoji: "📻" },
  { id: "pink", name: "Pink Noise", emoji: "🎵" },
  { id: "brown", name: "Brown Noise", emoji: "🌊" },
  { id: "rain", name: "Rain", emoji: "🌧️" },
  { id: "ocean", name: "Ocean Waves", emoji: "🏖️" },
  { id: "fan", name: "Fan", emoji: "💨" },
];

interface SoundState {
  [key: string]: { playing: boolean; volume: number };
}

class SoundGenerator {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, AudioBufferSourceNode> = new Map();
  private gains: Map<string, GainNode> = new Map();
  private playing: Set<string> = new Set();

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  createNoiseBuffer(type: "white" | "pink" | "brown"): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === "brown") {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }

    return buffer;
  }

  createRainBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  createOceanBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let phase = 0;
    const freq = 0.1;
    for (let i = 0; i < bufferSize; i++) {
      phase += freq;
      const wave = Math.sin(phase) * 0.5 + 0.5;
      data[i] = (Math.random() * 2 - 1) * wave * 0.5;
    }

    return buffer;
  }

  createFanBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.5;
    }

    return buffer;
  }

  async play(soundId: string, volume: number = 0.5) {
    const ctx = this.init();
    if (ctx.state === "suspended") await ctx.resume();

    if (this.playing.has(soundId)) return;

    let buffer: AudioBuffer;
    switch (soundId) {
      case "white":
        buffer = this.createNoiseBuffer("white");
        break;
      case "pink":
        buffer = this.createNoiseBuffer("pink");
        break;
      case "brown":
        buffer = this.createNoiseBuffer("brown");
        break;
      case "rain":
        buffer = this.createRainBuffer();
        break;
      case "ocean":
        buffer = this.createOceanBuffer();
        break;
      case "fan":
        buffer = this.createFanBuffer();
        break;
      default:
        buffer = this.createNoiseBuffer("white");
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    this.nodes.set(soundId, source);
    this.gains.set(soundId, gain);
    this.playing.add(soundId);
  }

  stop(soundId: string) {
    const source = this.nodes.get(soundId);
    if (source) {
      source.stop();
      this.nodes.delete(soundId);
      this.gains.delete(soundId);
      this.playing.delete(soundId);
    }
  }

  setVolume(soundId: string, volume: number) {
    const gain = this.gains.get(soundId);
    if (gain) {
      gain.gain.setValueAtTime(volume, this.ctx!.currentTime);
    }
  }

  isPlaying(soundId: string) {
    return this.playing.has(soundId);
  }
}

export default function Sounds() {
  const [soundState, setSoundState, loaded] = useLocalStorage<SoundState>("sound-state", {});
  const generatorRef = useRef<SoundGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = new SoundGenerator();
    return () => {
      generatorRef.current?.stop;
    };
  }, []);

  const toggleSound = async (soundId: string) => {
    const gen = generatorRef.current;
    if (!gen) return;

    const current = soundState[soundId] || { playing: false, volume: 0.5 };

    if (current.playing) {
      gen.stop(soundId);
    } else {
      await gen.play(soundId, current.volume);
    }

    setSoundState({
      ...soundState,
      [soundId]: { ...current, playing: !current.playing },
    });
  };

  const changeVolume = (soundId: string, volume: number) => {
    const gen = generatorRef.current;
    if (!gen) return;

    gen.setVolume(soundId, volume);
    setSoundState({
      ...soundState,
      [soundId]: { ...soundState[soundId], playing: true, volume },
    });
  };

  if (!loaded) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <header className="text-center py-4">
          <h1 className="text-2xl font-light text-slate-200">Sleep Sounds</h1>
          <p className="text-slate-400 text-sm">Tap to play</p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          {SOUNDS.map((sound) => {
            const state = soundState[sound.id] || { playing: false, volume: 0.5 };
            return (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`flex flex-col items-center gap-2 p-6 rounded-2xl transition-colors ${
                  state.playing
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span className="text-4xl">{sound.emoji}</span>
                <span className="font-medium">{sound.name}</span>
                {state.playing && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.volume}
                    onChange={(e) => changeVolume(sound.id, parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full mt-2 accent-white"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-slate-800 rounded-xl">
          <p className="text-sm text-slate-400 text-center">
            Tip: Mix multiple sounds together by tapping several
          </p>
        </div>
      </div>
    </AppLayout>
  );
}