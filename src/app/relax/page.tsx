"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";

type Exercise = "breathing" | "pmr";

const BREATHING_STEPS = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 7 },
  { label: "Exhale", duration: 8 },
];

export default function Relax() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);

  const getStep = useCallback(() => BREATHING_STEPS[stepIndex], [stepIndex]);

  useEffect(() => {
    if (!isActive || !exercise) return;

    const step = getStep();
    setCountdown(step.duration);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setStepIndex((s) => {
            const next = (s + 1) % BREATHING_STEPS.length;
            if (next === 0) setCycles((c) => c + 1);
            return next;
          });
          return step.duration;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, exercise, stepIndex, getStep]);

  const startExercise = (type: Exercise) => {
    setExercise(type);
    setIsActive(true);
    setStepIndex(0);
    setCycles(0);
    setCountdown(BREATHING_STEPS[0].duration);
  };

  const stopExercise = () => {
    setIsActive(false);
    setExercise(null);
    setStepIndex(0);
    setCountdown(0);
    setCycles(0);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <header className="text-center py-4">
          <h1 className="text-2xl font-light text-slate-200">Relax</h1>
          <p className="text-slate-400 text-sm">Calming exercises</p>
        </header>

        {exercise === "breathing" && isActive ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray={552}
                  strokeDashoffset={552 - (552 * countdown) / getStep().duration}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-light text-indigo-400">{countdown}</p>
                <p className="text-lg text-slate-300">{getStep().label}</p>
              </div>
            </div>
            <p className="text-slate-400 mb-6">Cycle {cycles + 1}</p>
            <button
              onClick={stopExercise}
              className="px-8 py-3 bg-slate-700 rounded-xl text-slate-200"
            >
              Stop
            </button>
          </div>
        ) : exercise === "pmr" && isActive ? (
          <PMRExercise onComplete={stopExercise} />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => startExercise("breathing")}
              className="w-full flex items-center justify-between p-4 bg-indigo-900/50 hover:bg-indigo-900/70 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌬️</span>
                <div className="text-left">
                  <p className="font-medium text-slate-200">4-7-8 Breathing</p>
                  <p className="text-sm text-slate-400">4 in, 7 hold, 8 out</p>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => startExercise("pmr")}
              className="w-full flex items-center justify-between p-4 bg-emerald-900/50 hover:bg-emerald-900/70 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">💪</span>
                <div className="text-left">
                  <p className="font-medium text-slate-200">Progressive Relaxation</p>
                  <p className="text-sm text-slate-400">Tense and release muscles</p>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </button>

            <div className="mt-8 p-4 bg-slate-800 rounded-xl">
              <h3 className="font-medium text-slate-300 mb-2">Quick tips</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Practice in bed before sleeping</li>
                <li>• Keep the room dark and quiet</li>
                <li>• Focus on the physical sensations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function PMRExercise({ onComplete }: { onComplete: () => void }) {
  const muscleGroups = [
    { name: "Right foot", tense: "curl toes", release: "release" },
    { name: "Right calf", tense: "flex foot", release: "release" },
    { name: "Right thigh", tense: "clench thigh", release: "release" },
    { name: "Left foot", tense: "curl toes", release: "release" },
    { name: "Left calf", tense: "flex foot", release: "release" },
    { name: "Left thigh", tense: "clench thigh", release: "release" },
    { name: "Stomach", tense: "tighten stomach", release: "release" },
    { name: "Chest", tense: "fill lungs", release: "release" },
    { name: "Right hand", tense: "make fist", release: "release" },
    { name: "Right arm", tense: "bicep curl", release: "release" },
    { name: "Left hand", tense: "make fist", release: "release" },
    { name: "Left arm", tense: "bicep curl", release: "release" },
    { name: "Shoulders", tense: " shrug shoulders", release: "release" },
    { name: "Face", tense: "scrunch face", release: "release" },
  ];

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"tense" | "release">("tense");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (phase === "tense") {
            setPhase("release");
            setCountdown(20);
          } else {
            if (step < muscleGroups.length - 1) {
              setStep(step + 1);
              setPhase("tense");
              setCountdown(5);
            } else {
              onComplete();
            }
          }
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, step, onComplete]);

  const muscle = muscleGroups[step];

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <p className="text-2xl text-emerald-400 mb-2">
          {phase === "tense" ? "Tense" : "Release"} {muscle.name}
        </p>
        <p className="text-slate-400">{phase === "tense" ? muscle.tense : muscle.release}</p>
      </div>
      <div className="w-32 h-32 rounded-full bg-emerald-900/50 flex items-center justify-center mb-6">
        <span className="text-4xl font-mono text-emerald-400">{countdown}</span>
      </div>
      <p className="text-slate-400 mb-6">
        {step + 1} / {muscleGroups.length}
      </p>
      <button
        onClick={onComplete}
        className="px-8 py-3 bg-slate-700 rounded-xl text-slate-200"
      >
        Stop
      </button>
    </div>
  );
}