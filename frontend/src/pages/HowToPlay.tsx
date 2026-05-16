import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const clipSm =
    "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";
const clipMd =
    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))";

const toc = [
    { id: "overview", label: "Overview" },
    { id: "setup", label: "Getting started" },
    { id: "lobby", label: "Lobby" },
    { id: "roles", label: "Roles & words" },
    { id: "discussion", label: "Discussion" },
    { id: "voting", label: "Voting" },
    { id: "winning", label: "Win conditions" },
    { id: "host", label: "Host controls" },
    { id: "tips", label: "Tips" },
    { id: "after", label: "After a round" },
];

const phases = [
    {
        step: "01",
        title: "Lobby",
        desc: "Create or join a room, share the invite code, and wait for at least one other agent. The host launches the mission when ready.",
    },
    {
        step: "02",
        title: "Discussion",
        desc: "Everyone receives a secret word. One player is the spy with a different word. Use chat to describe your word without saying it outright.",
    },
    {
        step: "03",
        title: "Voting",
        desc: "The host opens voting. Each agent picks who they think is the spy. You have two minutes; you cannot vote for yourself.",
    },
    {
        step: "04",
        title: "Debrief",
        desc: "The host closes voting. Results reveal the spy, vote counts, and whether the agents or the spy won.",
    },
];

const winRows = [
    {
        outcome: "Agents win",
        condition:
            "Exactly one player receives the most votes, and that player is the spy.",
        color: "text-[#00ff64]",
    },
    {
        outcome: "Spy wins",
        condition:
            "The vote is tied, nobody receives a vote, or the player with the most votes is not the spy.",
        color: "text-red-400",
    },
];

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-[#00ff64]/50 shrink-0" />
                <span className="text-[#00ff64] text-[10px] font-bold tracking-[0.3em] uppercase">
                    {eyebrow}
                </span>
            </div>
            <h2
                className="text-white text-xl sm:text-2xl font-black tracking-[0.1em] uppercase"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
            >
                {title}
            </h2>
        </div>
    );
}

function RuleList({ items }: { items: string[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-white/55 text-sm leading-relaxed">
                    <span className="text-[#00ff64] shrink-0 mt-0.5">▸</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function Section({
    id,
    eyebrow,
    title,
    children,
}: {
    id: string;
    eyebrow: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <SectionHeader eyebrow={eyebrow} title={title} />
            <div
                className="border border-white/10 bg-white/2 px-4 py-5 sm:px-6 sm:py-6"
                style={{ clipPath: clipMd }}
            >
                {children}
            </div>
        </section>
    );
}

function HowToPlay() {
    return (
        <div
            className="min-h-[100dvh] bg-[#0a0a0a] px-3 sm:px-4 py-8 sm:py-12 pb-20 overflow-x-hidden"
            style={{
                backgroundImage: `radial-gradient(ellipse at 60% 20%, rgba(0,255,100,0.05) 0%, transparent 55%),
                                  radial-gradient(ellipse at 10% 90%, rgba(255,0,0,0.04) 0%, transparent 50%)`,
            }}
        >
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)`,
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto w-full min-w-0 flex flex-col gap-10 sm:gap-12">
                <header className="flex flex-col gap-4">
                    <p className="text-[#00ff64] text-[10px] font-bold tracking-[0.35em] uppercase">
                        Field manual
                    </p>
                    <h1
                        className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-[0.08em] uppercase leading-tight"
                        style={{
                            fontFamily: "'Arial Black', sans-serif",
                            textShadow: "0 0 40px rgba(0,255,100,0.12)",
                        }}
                    >
                        How to play
                    </h1>
                    <p className="text-white/40 text-sm sm:text-base max-w-2xl leading-relaxed">
                        A multiplayer social deduction game. Most agents share the same secret word; one
                        spy receives a different word. Talk, observe, and vote to expose the impostor — or
                        stay hidden if you are the spy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link
                            to="/create-room"
                            className="px-6 py-3 bg-[#00ff64] text-black text-[10px] font-bold tracking-[0.2em] uppercase text-center hover:bg-white transition-all duration-200"
                            style={{ clipPath: clipSm }}
                        >
                            Create room
                        </Link>
                        <Link
                            to="/join-room"
                            className="px-6 py-3 border border-white/20 text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase text-center hover:border-[#00ff64]/50 hover:text-[#00ff64] transition-all duration-200"
                            style={{ clipPath: clipSm }}
                        >
                            Join room
                        </Link>
                    </div>
                </header>

                <nav
                    className="border border-white/10 bg-white/2 px-4 py-4 sm:px-5"
                    style={{ clipPath: clipSm }}
                    aria-label="On this page"
                >
                    <p className="text-white/30 text-[9px] tracking-[0.25em] uppercase mb-3">On this page</p>
                    <ul className="flex flex-wrap gap-2">
                        {toc.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className="inline-block px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase border border-white/10 text-white/50 hover:text-[#00ff64] hover:border-[#00ff64]/40 hover:bg-[#00ff64]/5 transition-all duration-200"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <SectionHeader eyebrow="Mission flow" title="Four phases" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {phases.map((p) => (
                            <div
                                key={p.step}
                                className="border border-white/10 bg-white/2 px-4 py-4 sm:px-5 sm:py-5"
                                style={{ clipPath: clipSm }}
                            >
                                <span className="text-white/20 text-[10px] font-bold tracking-[0.3em]">
                                    {p.step}
                                </span>
                                <h3
                                    className="text-[#00ff64] text-sm font-black tracking-[0.15em] uppercase mt-1 mb-2"
                                    style={{ fontFamily: "'Arial Black', sans-serif" }}
                                >
                                    {p.title}
                                </h3>
                                <p className="text-white/45 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Section id="overview" eyebrow="Basics" title="Overview">
                    <p className="text-white/55 text-sm leading-relaxed mb-4">
                        <strong className="text-white/80">Find the Spy</strong> is a real-time multiplayer social
                        deduction game. Everyone joins the same private room, receives a secret word, and uses
                        chat to figure out who does not belong. One player is randomly chosen as the{" "}
                        <span className="text-red-400/90">spy</span>; everyone else is an{" "}
                        <span className="text-[#00ff64]">agent</span>.
                    </p>
                    <p className="text-white/55 text-sm leading-relaxed mb-4">
                        Agents all get the <em>same</em> word (for example, &quot;Airport&quot;). The spy gets a
                        similar but <em>different</em> word from the same pair (for example, &quot;Train station&quot;).
                        Nobody sees anyone else&apos;s word — only their own role label and word in the mission header.
                    </p>
                    <p className="text-white/55 text-sm leading-relaxed">
                        The goal is simple: agents must expose and vote out the spy; the spy must survive by
                        sounding convincing and steering suspicion elsewhere.
                    </p>
                </Section>

                <Section id="setup" eyebrow="Step 1" title="Getting started">
                    <RuleList
                        items={[
                            "Create a room with an operation name and your agent name — you become the host.",
                            "Share the invite code from the lobby (use the copy button).",
                            "Join using the invite code from the host plus your agent name.",
                            "At least 2 players are required before the host can launch.",
                            "Maximum 8 agents per room.",
                        ]}
                    />
                </Section>

                <Section id="lobby" eyebrow="Step 2" title="Lobby">
                    <RuleList
                        items={[
                            "After creating or joining, you land in the waiting room with the full agent list (up to 8).",
                            "The host sees Launch mission; other players see Waiting for host.",
                            "Launch mission requires at least 2 players — the button stays disabled with only one agent.",
                            "Anyone can leave at any time. If the host leaves, the room closes for everyone.",
                            "When the host launches, every connected player is moved to the mission screen together.",
                        ]}
                    />
                </Section>

                <Section id="roles" eyebrow="Step 3" title="Roles & words">
                    <RuleList
                        items={[
                            "Agents: same secret word. Spot answers that do not match your word.",
                            "Spy: different word. Stay vague; you do not know the agents' word.",
                            "Your role and word appear in the mission header. Never say the word outright.",
                        ]}
                    />
                </Section>

                <Section id="discussion" eyebrow="Step 4" title="Discussion">
                    <RuleList
                        items={[
                            "Use live chat during the discussion phase.",
                            "No fixed timer — the host starts voting when ready.",
                            "You can run multiple discussion and voting rounds per mission.",
                        ]}
                    />
                </Section>

                <Section id="voting" eyebrow="Step 5" title="Voting">
                    <RuleList
                        items={[
                            "Only the host can open voting with Start voting (available during discussion).",
                            "A 2-minute countdown starts. It turns red when 30 seconds or less remain.",
                            "Select one other agent and press Submit vote. You cannot vote for yourself.",
                            "After submitting, your choice is locked until the host ends voting.",
                            "You can change your selection before submitting; submitting again updates your vote.",
                            "Live vote totals appear on each player card so you can see where suspicion is heading.",
                            "The host ends voting with End voting — results are calculated and the mission debrief appears.",
                            "Discussion can resume after a vote if the host has not ended the game; you may vote again in a later round.",
                        ]}
                    />
                </Section>

                <Section id="winning" eyebrow="Step 6" title="Win conditions">
                    <p className="text-white/55 text-sm leading-relaxed mb-4">
                        When voting ends, the game tallies ballots and applies these rules:
                    </p>
                    <div className="flex flex-col gap-3">
                        {winRows.map((row) => (
                            <div
                                key={row.outcome}
                                className="border border-white/10 bg-white/2 px-4 py-4"
                                style={{ clipPath: clipSm }}
                            >
                                <p className={`text-sm font-black tracking-[0.12em] uppercase mb-2 ${row.color}`}>
                                    {row.outcome}
                                </p>
                                <p className="text-white/50 text-sm leading-relaxed">{row.condition}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-white/35 text-xs leading-relaxed mt-4">
                        Tie example: if two players each get 2 votes and that is the highest count, the spy wins.
                        Wrong accusation: if the top-voted player is an innocent agent, the spy wins. Clear
                        accusation: one player alone has the most votes and they are the spy — all agents win.
                    </p>
                </Section>

                <Section id="host" eyebrow="Reference" title="Host controls">
                    <RuleList
                        items={[
                            "Start voting — opens voting during discussion.",
                            "End voting — tallies votes and shows the debrief.",
                            "End game — ends the session for everyone.",
                            "Back to lobby — returns all players to the waiting room.",
                            "Play Again on the debrief starts a new round with new words and a new spy.",
                        ]}
                    />
                </Section>

                <Section id="tips" eyebrow="Strategy" title="Tips">
                    <RuleList
                        items={[
                            "Agents: ask specific questions and avoid split votes that cause a tie.",
                            "Spy: listen first, stay vague, and push votes onto confident innocents.",
                            "Do not say your word directly — use categories, traits, or associations.",
                        ]}
                    />
                </Section>

                <Section id="after" eyebrow="Step 7" title="After a round">
                    <RuleList
                        items={[
                            "The debrief reveals the spy, each word, vote totals, and whether you won.",
                            "Play Again keeps the room and deals new words.",
                            "If a player leaves mid-game and only one agent remains, everyone returns to the lobby.",
                        ]}
                    />
                </Section>

                <div
                    className="border border-[#00ff64]/20 bg-[#00ff64]/5 px-5 py-6 text-center"
                    style={{ clipPath: clipMd }}
                >
                    <p className="text-white/50 text-sm mb-4">Ready to go undercover?</p>
                    <Link
                        to="/"
                        className="inline-block px-8 py-3 bg-[#00ff64] text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all duration-200"
                        style={{ clipPath: clipSm }}
                    >
                        Return to base
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HowToPlay;
