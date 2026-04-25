"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Schedule {
  bedtime: string;
  waketime: string;
  notifications: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getTimeValue(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(/ /g, "");
}

export default function Home() {
  const [schedule, setSchedule, loaded] = useLocalStorage<Schedule>("sleep-schedule", {
    bedtime: "23:00",
    waketime: "07:00",
    notifications: true,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sleeping, setSleeping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loaded && schedule.notifications && "Notification" in window) {
      Notification.requestPermission();
    }
  }, [loaded, schedule.notifications]);

  const timeUntilBed = () => {
    const [hours, mins] = schedule.bedtime.split(":").map(Number);
    const bedDate = new Date();
    bedDate.setHours(hours, mins, 0, 0);
    if (bedDate < currentTime) bedDate.setDate(bedDate.getDate() + 1);
    const diff = bedDate.getTime() - currentTime.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: hoursLeft, mins: minsLeft };
  };

  const timeUntilWake = () => {
    const [hours, mins] = schedule.waketime.split(":").map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, mins, 0, 0);
    if (wakeDate < currentTime) wakeDate.setDate(wakeDate.getDate() + 1);
    const diff = wakeDate.getTime() - currentTime.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: hoursLeft, mins: minsLeft };
  };

  const { hours: hrsToBed, mins: minToBed } = timeUntilBed();
  const { hours: hrsToWake, mins: minToWake } = timeUntilWake();

  if (!loaded) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-4">
        <header className="text-center py-4">
          <h1 className="text-2xl font-light text-slate-200">Sleep Better</h1>
          <p className="text-slate-400 text-sm">{formatTime(currentTime)}</p>
        </header>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Until Bed</p>
            <p className="text-xl font-mono text-indigo-400">
              {hrsToBed}h {minToBed}m
            </p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Until Wake</p>
            <p className="text-xl font-mono text-emerald-400">
              {hrsToWake}h {minToWake}m
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Schedule</h2>
          <div className="space-y-3">
            <label className="flex justify-between items-center">
              <span className="text-slate-400">Bedtime</span>
              <input
                type="time"
                value={schedule.bedtime}
                onChange={(e) => setSchedule({ ...schedule, bedtime: e.target.value })}
                className="bg-slate-700 text-slate-100 rounded-lg px-3 py-2 text-right"
              />
            </label>
            <label className="flex justify-between items-center">
              <span className="text-slate-400">Wake time</span>
              <input
                type="time"
                value={schedule.waketime}
                onChange={(e) => setSchedule({ ...schedule, waketime: e.target.value })}
                className="bg-slate-700 text-slate-100 rounded-lg px-3 py-2 text-right"
              />
            </label>
            <label className="flex justify-between items-center">
              <span className="text-slate-400">Notifications</span>
              <input
                type="checkbox"
                checked={schedule.notifications}
                onChange={(e) => setSchedule({ ...schedule, notifications: e.target.checked })}
                className="w-5 h-5 accent-indigo-500"
              />
            </label>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSleeping(!sleeping)}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              sleeping
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {sleeping ? "Good Night" : "I'm Sleeping"}
          </button>
          <button
            disabled={!sleeping}
            onClick={() => {
              setSleeping(false);
              if (typeof window !== "undefined") {
                const now = new Date();
                const logs = JSON.parse(localStorage.getItem("sleep-logs") || "[]");
                logs.unshift({
                  date: now.toISOString().split("T")[0],
                  bedtime: schedule.bedtime,
                  waketime: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(/ /g, ""),
                });
                localStorage.setItem("sleep-logs", JSON.stringify(logs));
              }
            }}
            className="flex-1 py-3 rounded-xl font-medium bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Wake Up
          </button>
        </div>

        <div className="flex justify-around text-center">
          <Link href="/sounds" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <span className="text-2xl">🔊</span>
            <span className="text-sm text-slate-400">Sounds</span>
          </Link>
          <Link href="/track" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <span className="text-2xl">📊</span>
            <span className="text-sm text-slate-400">History</span>
          </Link>
          <Link href="/relax" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <span className="text-2xl">🧘</span>
            <span className="text-sm text-slate-400">Relax</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}