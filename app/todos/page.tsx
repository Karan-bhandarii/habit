
"use client";

import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiCalendar,
} from "react-icons/fi";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
};

type Filter = "All" | "Active" | "Completed";

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] =
    useState<Todo["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("habitflow-todos");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTodos(
            parsed.filter(
              (todo) =>
                todo &&
                typeof todo.id === "string" &&
                typeof todo.title === "string"
            )
          );
        }
      }
    } catch {
      setTodos([]);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("habitflow-todos", JSON.stringify(todos));
    }
  }, [todos, loaded]);

  function addTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      priority,
      dueDate,
    };

    setTodos((current) => [newTodo, ...current]);
    setTitle("");
    setPriority("Medium");
    setDueDate("");
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }

  function deleteTodo(id: string) {
    setTodos((current) =>
      current.filter((todo) => todo.id !== id)
    );
    setDeleteId(null);
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "Active") return !todo.completed;
    if (filter === "Completed") return todo.completed;
    return true;
  });

  const priorityStyle = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-blue-50 text-blue-600",
    Low: "bg-gray-100 text-gray-500",
  };

  return (
    <main className="min-h-screen bg-[#f8faff] px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">
            YOUR PERSONAL SPACE
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Todo List
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Keep it simple. Get things done.
          </p>
        </div>

        {/* Add task */}
        <form
          onSubmit={addTodo}
          className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5"
        >
          <label
            htmlFor="todo-title"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Add a task
          </label>

          <div className="flex gap-2">
            <input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={!title.trim()}
              aria-label="Add task"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="todo-priority"
                className="mb-1.5 block text-xs text-gray-500"
              >
                Priority
              </label>

              <select
                id="todo-priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Todo["priority"])
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="todo-date"
                className="mb-1.5 block text-xs text-gray-500"
              >
                Due date (optional)
              </label>

              <input
                id="todo-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </form>

        {/* Task filters */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your tasks</h2>

          <div className="flex rounded-lg bg-gray-100 p-1">
            {(["All", "Active", "Completed"] as Filter[]).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    filter === item
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {filteredTodos.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiCheck size={22} />
              </div>

              <p className="text-sm font-medium text-gray-800">
                {filter === "Completed"
                  ? "No completed tasks yet"
                  : filter === "Active"
                    ? "You're all caught up"
                    : "Your list is empty"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Add a task above to get started.
              </p>
            </div>
          ) : (
            filteredTodos.map((todo, index) => {
              const isOverdue =
                !todo.completed &&
                !!todo.dueDate &&
                todo.dueDate <
                  new Date().toLocaleDateString("en-CA");

              return (
                <div
                  key={todo.id}
                  className={`group flex items-start gap-3 px-4 py-4 sm:px-5 ${
                    index !== filteredTodos.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={
                      todo.completed
                        ? "Mark task incomplete"
                        : "Complete task"
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      todo.completed
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white hover:border-blue-500"
                    }`}
                  >
                    {todo.completed && <FiCheck size={13} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`break-words text-sm font-medium ${
                        todo.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-medium ${priorityStyle[todo.priority]}`}
                      >
                        {todo.priority}
                      </span>

                      {todo.dueDate && (
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            isOverdue
                              ? "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          <FiCalendar size={12} />
                          {isOverdue ? "Overdue · " : ""}
                          {todo.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(todo.id)}
                    aria-label="Delete task"
                    className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <h3
                  id="delete-title"
                  className="text-base font-semibold"
                >
                  Delete this task?
                </h3>

                <button
                  onClick={() => setDeleteId(null)}
                  aria-label="Cancel deletion"
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                >
                  <FiX size={18} />
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                This task will be permanently removed from your list.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={() => deleteTodo(deleteId)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
