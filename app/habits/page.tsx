
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiTarget,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiCalendar,
  FiZap,
} from "react-icons/fi";

type HabitType = "build" | "quit";

type Habit = {
  id: string;
  name: string;
  type: HabitType;
  createdAt: string;
  completedDates: string[];
};

const STORAGE_KEY = "habitflow-habits";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDates(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    return new Date(year, month, index + 1);
  });
}

function getStreak(habit: Habit, today: Date) {
  const completed = new Set(habit.completedDates);

  let streak = 0;
  const current = new Date(today);

  // If today is not completed yet, allow yesterday's streak to continue.
  if (!completed.has(getDateKey(current))) {
    current.setDate(current.getDate() - 1);
  }

  while (completed.has(getDateKey(current))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function migrateHabits(value: unknown): Habit[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      name: typeof item.name === "string" ? item.name : "Untitled habit",
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : new Date().toISOString(),
      completedDates: Array.isArray(item.completedDates)
        ? item.completedDates.filter(
            (date): date is string => typeof date === "string"
          )
        : [],
      // Support older saved habits that used status: "active" | "quit".
      type:
        item.type === "quit" || item.status === "quit"
          ? "quit"
          : "build",
    }));
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState<HabitType>("build");

  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();
    // Client-only initialization avoids rendering a different date on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(now);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHabits(migrateHabits(JSON.parse(saved)));
      }
    } catch {
      setHabits([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits, loaded]);

  useEffect(() => {
    function openAddHabit() {
      setShowModal(true);
    }

    window.addEventListener("open-add-habit", openAddHabit);

    return () => {
      window.removeEventListener("open-add-habit", openAddHabit);
    };
  }, []);

  const monthDates = useMemo(
    () => (currentMonth ? getMonthDates(currentMonth) : []),
    [currentMonth]
  );

  const monthLabel = currentMonth
    ? currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const todayKey = today ? getDateKey(today) : "";

  const todayCompleted = habits.filter((habit) =>
    habit.completedDates.includes(todayKey)
  ).length;

  const buildHabits = habits.filter((habit) => habit.type === "build").length;
  const quitHabits = habits.filter((habit) => habit.type === "quit").length;

  const totalCompletions = habits.reduce(
    (total, habit) => total + habit.completedDates.length,
    0
  );

  function addHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = habitName.trim();

    if (!name) {
      setError("Please enter a habit name.");
      return;
    }

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      type: habitType,
      createdAt: new Date().toISOString(),
      completedDates: [],
    };

    setHabits((previous) => [...previous, newHabit]);
    setHabitName("");
    setHabitType("build");
    setError("");
    setShowModal(false);
  }

  function toggleDate(habitId: string, dateKey: string) {
    // Future dates cannot be marked.
    if (dateKey > todayKey) return;

    setHabits((previous) =>
      previous.map((habit) => {
        if (habit.id !== habitId) return habit;

        const alreadyCompleted = habit.completedDates.includes(dateKey);

        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter((date) => date !== dateKey)
            : [...habit.completedDates, dateKey].sort(),
        };
      })
    );
  }

  function deleteHabit(habitId: string) {
    setHabits((previous) =>
      previous.filter((habit) => habit.id !== habitId)
    );
  }

  function changeMonth(direction: number) {
    setCurrentMonth((previous) => {
      const base = previous ?? new Date();

      return new Date(
        base.getFullYear(),
        base.getMonth() + direction,
        1
      );
    });
  }

  const isCurrentMonth =
    currentMonth && today
      ? currentMonth.getFullYear() === today.getFullYear() &&
        currentMonth.getMonth() === today.getMonth()
      : false;

  if (!mounted || !today || !currentMonth) {
    return (
      <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">Loading your habits...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <FiTarget />
              Personal growth
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Habit Tracker
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Small actions. Consistent days. Better you.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiPlus size={18} />
            Add Habit
          </button>
        </header>

        {/* Overview */}
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiTarget size={18} />
            </div>
            <p className="text-sm text-slate-500">Total habits</p>
            <p className="mt-1 text-2xl font-bold">{habits.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCheck size={18} />
            </div>
            <p className="text-sm text-slate-500">Completed today</p>
            <p className="mt-1 text-2xl font-bold">{todayCompleted}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FiTrendingUp size={18} />
            </div>
            <p className="text-sm text-slate-500">Total check-ins</p>
            <p className="mt-1 text-2xl font-bold">{totalCompletions}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiZap size={18} />
            </div>
            <p className="text-sm text-slate-500">Best current streak</p>
            <p className="mt-1 text-2xl font-bold">
              {habits.length
                ? Math.max(...habits.map((habit) => getStreak(habit, today)))
                : 0}
              <span className="ml-1 text-sm font-medium text-slate-400">
                days
              </span>
            </p>
          </div>
        </section>

        {/* Tracker */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div>
              <h2 className="font-bold">Your habits</h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a square to mark a day complete.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50"
              >
                <FiChevronLeft />
              </button>

              <span className="min-w-28 text-center text-sm font-semibold">
                {monthLabel}
              </span>

              <button
                onClick={() => changeMonth(1)}
                disabled={isCurrentMonth}
                aria-label="Next month"
                className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiCalendar size={25} />
              </div>

              <h3 className="font-semibold">Start with one small habit</h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Build a good habit or quit a bad one. Track your progress one
                day at a time.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <FiPlus />
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {habits.map((habit) => {
                const isQuit = habit.type === "quit";
                const completedSet = new Set(habit.completedDates);
                const streak = getStreak(habit, today);
                const monthCompleted = monthDates.filter((date) =>
                  completedSet.has(getDateKey(date))
                ).length;

                return (
                  <div
                    key={habit.id}
                    className="px-4 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isQuit
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {isQuit ? <FiX size={18} /> : <FiTarget size={18} />}
                        </div>

                        <div className="min-w-0">
                          <h3 className="wrap-break-word text-sm font-semibold text-slate-800">
                            {habit.name}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                isQuit
                                  ? "bg-red-50 text-red-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {isQuit ? "QUIT HABIT" : "BUILD HABIT"}
                            </span>

                            <span className="text-xs text-slate-400">
                              {streak} day streak
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteHabit(habit.id)}
                        aria-label={`Delete ${habit.name}`}
                        title="Delete habit"
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    {/* Compact GitHub-style daily grid */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {monthDates.map((date) => {
                        const dateKey = getDateKey(date);
                        const isCompleted = completedSet.has(dateKey);
                        const isFuture = dateKey > todayKey;
                        const isToday = dateKey === todayKey;

                        return (
                          <button
                            key={dateKey}
                            onClick={() => toggleDate(habit.id, dateKey)}
                            disabled={isFuture}
                            title={`${date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}${isCompleted ? " — completed" : ""}`}
                            aria-label={`${habit.name}, ${dateKey}, ${
                              isCompleted ? "completed" : "not completed"
                            }`}
                            className={`h-5 w-5 shrink-0 rounded-[5px] border transition sm:h-[22px] sm:w-[22px] ${
                              isCompleted
                                ? isQuit
                                  ? "border-red-600 bg-red-500"
                                  : "border-blue-600 bg-blue-500"
                                : isFuture
                                  ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                                  : isToday
                                    ? isQuit
                                      ? "border-red-300 bg-red-50 ring-1 ring-red-200"
                                      : "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                                    : "border-slate-200 bg-slate-100 hover:border-slate-300 hover:bg-slate-200"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span>
                        {monthCompleted} / {monthDates.length} days tracked
                      </span>

                      <span
                        className={
                          isQuit ? "text-red-500" : "text-blue-500"
                        }
                      >
                        {isQuit ? "Breaking the cycle" : "Building consistency"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-blue-500" />
                Build habit
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-red-500" />
                Quit habit
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Data saved on this device
            </p>
          </div>
        </section>

        {/* Small summary */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            {buildHabits} habits to build
          </span>

          <span className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            {quitHabits} habits to quit
          </span>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-habit-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="add-habit-title" className="text-xl font-bold">
                  Create a habit
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose what you want to change.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={19} />
              </button>
            </div>

            <form onSubmit={addHabit}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Habit name
              </label>

              <input
                autoFocus
                value={habitName}
                onChange={(event) => {
                  setHabitName(event.target.value);
                  setError("");
                }}
                placeholder={
                  habitType === "build"
                    ? "e.g. Gym, Reading, Coding"
                    : "e.g. Smoking, Junk food, Scrolling"
                }
                maxLength={60}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {habitName.length}/60
              </p>

              <p className="mb-3 mt-4 text-sm font-semibold text-slate-700">
                Choose habit type
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHabitType("quit")}
                  className={`rounded-xl border p-4 text-left transition ${
                    habitType === "quit"
                      ? "border-red-400 bg-red-50 ring-2 ring-red-100"
                      : "border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                  }`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <FiX size={20} />
                  </div>

                  <p className="text-sm font-bold text-red-600">
                    Quit a Habit
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Break bad habits and avoid unwanted behavior.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setHabitType("build")}
                  className={`rounded-xl border p-4 text-left transition ${
                    habitType === "build"
                      ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FiTarget size={20} />
                  </div>

                  <p className="text-sm font-bold text-blue-600">
                    Build a Habit
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Develop good routines and stay consistent.
                  </p>
                </button>
              </div>

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                  habitType === "quit"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FiPlus size={17} />
                Create {habitType === "quit" ? "Quit" : "Build"} Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
