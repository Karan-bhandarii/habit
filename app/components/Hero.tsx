
import Link from "next/link";
import { FiGrid, FiCheckSquare, FiArrowUpRight } from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8faff] px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-20">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Habit<span className="text-blue-600">Flow</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Build better days.
          </p>
        </header>

        <section>
          <p className="mb-3 text-sm font-medium text-blue-600">
            YOUR PERSONAL SPACE
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Keep it simple.
            <br />
            <span className="text-gray-400">Stay consistent.</span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-6 text-gray-500">
            Track your habits, organize your tasks, and focus on what matters.
          </p>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/habits"
            className="group rounded-2xl border border-blue-100 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiGrid size={21} />
              </div>

              <FiArrowUpRight
                size={20}
                className="text-gray-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-8 text-lg font-semibold text-gray-900">
              Habits
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Build routines, one day at a time.
            </p>
          </Link>

          <Link
            href="/todos"
            className="group rounded-2xl border border-blue-100 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiCheckSquare size={21} />
              </div>

              <FiArrowUpRight
                size={20}
                className="text-gray-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-8 text-lg font-semibold text-gray-900">
              Todo
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Organize tasks and get things done.
            </p>
          </Link>
        </section>

        <footer className="mt-16 border-t border-gray-200 pt-5">
          <p className="text-xs text-gray-400">
            Small steps. Every day.
          </p>
        </footer>
      </div>
    </main>
  );
}
