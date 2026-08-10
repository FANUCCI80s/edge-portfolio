"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

type Message = {
  id: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/messages", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load messages.");
      }

      setUsers(data.users || []);
      setMessages(data.messages || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load messages."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedUserId,
          subject: subject.trim() || null,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send message.");
      }

      setSuccess("Message sent successfully.");
      setSubject("");
      setMessage("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <div className="min-h-screen bg-[#050807] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Administration
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Messages
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Send direct messages to users and notify them in their account.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* User selection */}
          <section className="rounded-2xl border border-white/10 bg-[#0b100e] p-5 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Select User
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose the user who should receive the message.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
            />

            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-gray-500">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-gray-500">
                  No users found.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = selectedUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-white/5 bg-black/20 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : user.status === "BLOCKED"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Compose message */}
          <section className="rounded-2xl border border-white/10 bg-[#0b100e] p-5 shadow-xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Send Direct Message
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                The user will receive a notification when the message is
                sent.
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Recipient
                </label>

                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                  {selectedUserId ? (
                    (() => {
                      const selectedUser = users.find(
                        (user) => user.id === selectedUserId
                      );

                      return selectedUser ? (
                        <div>
                          <p className="font-medium text-white">
                            {selectedUser.firstName}{" "}
                            {selectedUser.lastName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {selectedUser.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          Select a user
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-gray-500">
                      Select a user from the list
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Message subject"
                  maxLength={200}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your message to the user..."
                  rows={9}
                  maxLength={5000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />

                <div className="mt-2 text-right text-xs text-gray-600">
                  {message.length}/5000
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || !selectedUserId}
                className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>
        </div>

        {/* Sent messages */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b100e] p-5 shadow-xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Message History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Messages sent by administrators.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/5 bg-black/20 p-5 text-sm text-gray-500">
              Loading message history...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center text-sm text-gray-500">
              No messages have been sent yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {item.subject || "No subject"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        To: {item.recipient.firstName}{" "}
                        {item.recipient.lastName} (
                        {item.recipient.email})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                          item.isRead
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>

                      <span className="text-xs text-gray-600">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}