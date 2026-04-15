"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/board/Header";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { TeamData } from "@/types";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const [discordConnected, setDiscordConnected] = useState<boolean | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const error = searchParams.get("error");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json()),
      api.team.get(),
    ]).then(([me, teamData]) => {
      setDiscordConnected(!!me.discordConnected);
      setTeam(teamData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.discord.disconnect();
      setDiscordConnected(false);
    } catch {
      // silent
    }
    setDisconnecting(false);
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const connectUrl = `/api/auth/discord?token=${token}`;

  return (
    <div className="h-full flex flex-col bg-white">
      <Header backHref="/" />
      <main className="flex-1 px-6 sm:px-10 py-10 max-w-2xl mx-auto w-full animate-fade-in-up">
        <h1 className="text-3xl font-bold text-ink mb-2">Settings</h1>
        <p className="text-ink-secondary mb-10">Manage your account and integrations.</p>

        {/* Error from Discord OAuth */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
            {error === "discord_failed"
              ? "Discord connection failed. Please try again."
              : error === "invalid_state"
                ? "Invalid request. Please try connecting again."
                : `Error: ${error}`}
          </div>
        )}

        {/* Profile section */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-ink mb-4">Profile</h2>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center text-lg font-bold">
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-ink">{user?.name || "No name set"}</p>
                <p className="text-sm text-ink-secondary">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Discord integration */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-4">Discord Integration</h2>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-start gap-4">
              {/* Discord logo */}
              <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">Discord</p>
                <p className="text-sm text-ink-secondary mt-1">
                  {loading
                    ? "Checking connection..."
                    : discordConnected
                      ? "Your Discord account is connected. External users can send you messages via Discord DM."
                      : "Connect your Discord account so external users can message you from your boards."}
                </p>
                <div className="mt-4">
                  {loading ? null : discordConnected ? (
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="text-sm font-medium px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-150 disabled:opacity-40"
                    >
                      {disconnecting ? "Disconnecting..." : "Disconnect Discord"}
                    </button>
                  ) : (
                    <a
                      href={connectUrl}
                      className="inline-block text-sm font-semibold px-5 py-2.5 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-all duration-150 active:scale-[0.97]"
                    >
                      Connect Discord
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team management — only for admins */}
        {team && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink mb-4">Team</h2>
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">{team.name}</p>
                  <p className="text-sm text-ink-secondary">{team.members.length} members</p>
                </div>
              </div>

              {/* Invite code — admin only */}
              {user?.role === "admin" && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-ink mb-2">Invite Code</p>
                  <div className="flex items-center gap-3">
                    <code className="bg-white border border-border rounded-xl px-4 py-2.5 text-lg font-mono tracking-widest text-ink select-all">
                      {team.inviteCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(team.inviteCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-sm font-medium px-3 py-2 border border-border rounded-xl text-ink-secondary hover:text-ink hover:border-ink-tertiary transition-all"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={async () => {
                        setRegenerating(true);
                        try {
                          const { inviteCode } = await api.team.regenerateInviteCode();
                          setTeam({ ...team, inviteCode });
                        } catch {}
                        setRegenerating(false);
                      }}
                      disabled={regenerating}
                      className="text-sm font-medium px-3 py-2 border border-border rounded-xl text-ink-secondary hover:text-ink hover:border-ink-tertiary transition-all disabled:opacity-40"
                    >
                      {regenerating ? "..." : "Regenerate"}
                    </button>
                  </div>
                  <p className="text-xs text-ink-tertiary mt-2">Share this code with employees to let them join your team.</p>
                </div>
              )}

              {/* Members list */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-ink mb-3">Members</p>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-white border border-border rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-ink">
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{member.name || member.email}</p>
                          <p className="text-[11px] text-ink-tertiary">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          member.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-surface text-ink-tertiary"
                        }`}>
                          {member.role}
                        </span>
                        {user?.role === "admin" && member.id !== user.id && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove ${member.name || member.email} from the team?`)) return;
                              await api.team.removeMember(member.id);
                              setTeam({ ...team, members: team.members.filter((m) => m.id !== member.id) });
                            }}
                            className="text-xs text-ink-tertiary hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
