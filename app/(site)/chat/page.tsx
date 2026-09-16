import type { Metadata } from "next";
import { PixelBotIdle } from "@/app/components/pixel-bot";
import { Reveal } from "@/app/components/reveal";
import { ChatRoom } from "./chat-room";

export const metadata: Metadata = {
  title: "Ask the pass — Milli",
  description:
    "Ask about tonight's dishes, what is vegetarian and how hot things run.",
};

export default function ChatPage() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_20%_8%,rgba(233,163,25,0.16),transparent_62%),radial-gradient(45%_45%_at_92%_75%,rgba(26,122,86,0.10),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-14 md:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-center lg:gap-14">
          <div>
            <Reveal>
              <PixelBotIdle size={104} />
            </Reveal>

            <Reveal as="p" delay={0.05} className="eyebrow mt-6 text-muted">
              <span className="h-px w-8 bg-ember" />
              Ask the pass
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="mt-5 font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[0.98] font-light tracking-[-0.035em] text-balance">
                Someone who has
                <br />
                <span className="text-ember italic">tasted everything.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-md text-[17px] leading-relaxed text-muted text-pretty">
                Every dish going out tonight, what is in it, how hot it runs and
                what to order if you cannot decide. Ask in plain words.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <ul className="mt-8 space-y-2.5 border-t border-line pt-7 text-[15px] text-muted">
                {[
                  ["bg-amber", "Ingredients and allergens, dish by dish"],
                  ["bg-ember", "Honest heat levels, 0 to 3"],
                  ["bg-basil", "What to order for two, or for six"],
                ].map(([dot, label]) => (
                  <li key={label} className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <ChatRoom />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
