"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SleepLog {
  date: string;
  bedtime: string;
  waketime: string;
  duration?: number;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) return `${h - 24}h ${m}m`;
  return `${h}h ${m}m`;
}

export default function Track() {
  const [logs, setLogs, loaded] = useLocalStorage<SleepLog[]>("sleep-logs", []);
  const [stats, setStats] = useLocalStorage<{ weeklyAvg: number; streak: number }>("sleep-stats", {
    weeklyAvg: 0,
    streak: 0,
  });

  useEffect(() => {
    if (!loaded || logs.length < 7) return;

    const last7 = logs.slice(0, 7);
    let totalMins = 0;
    let valid = 0;

    last7.forEach((log) => {
      const [bedH, bedM] = log.bedtime.split(":").map(Number);
      const [wakeH, wakeM] = log.waketime.split(":").map(Number);
      let bedMins = bedH * 60 + bedM;
      let wakeMins = wakeH * 60 + wakeM;
      if (wakeMins < bedMins) wakeMins += 24 * 60;
      const duration = wakeMins - bedMins;
      if (duration >= 240 && duration <= 600) {
        totalMins += duration;
        valid++;
      }
    });

    const weeklyAvg = valid > 0 ? Math.round(totalMins / valid) : 0;

    let streak = 0;
    for (const log of logs) {
      const [bedH] = log.bedtime.split(":").map(Number);
      if (bedH >= 21 || bedH <= 3) streak++;
      else break;
    }

    setStats({ weeklyAvg, streak });
  }, [logs, loaded, setStats]);

  const weeklyGoal = 8 * 60;

  if (!loaded) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <header className="text-center py-4">
          <h1 className="text-2xl font-light text-slate-200">Sleep Track</h1>
          <p className="text-slate-400 text-sm">Your sleep history</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Weekly Avg</p>
            <p className="text-xl font-mono text-indigo-400">
              {stats.weeklyAvg ? formatDuration(stats.weeklyAvg) : "--"}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Streak</p>
            <p className="text-xl font-mono text-emerald-400">
              {stats.streak} days
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-4">😴</p>
              <p>No sleep logs yet</p>
              <p className="text-sm mt-2">Hit "I'm Sleeping" on the home screen to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => {
                const [bedH, bedM] = log.bedtime.split(":").map(Number);
                const [wakeH, wakeM] = log.waketime.split(":").map(Number);
                let bedMins = bedH * 60 + bedM;
                let wakeMins = wakeH * 60 + wakeM;
                if (wakeMins < bedMins) wakeMins += 24 * 60;
                const duration = wakeMins - bedMins;
                const onTarget = duration >= 420 && duration <= 540;

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      onTarget ? "bg-emerald-900/30" : "bg-slate-800"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-200">{log.date}</p>
                      <p className="text-sm text-slate-400">
                        {log.bedtime} → {log.waketime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono ${onTarget ? "text-emerald-400" : "text-slate-300"}`}>
                        {formatDuration(duration)}
                      </p>
                      {onTarget && <p className="text-xs text-emerald-500">✓ On target</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="mt-4 p-3 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 text-center">
              Target: 7-9 hours per night for optimal health
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}