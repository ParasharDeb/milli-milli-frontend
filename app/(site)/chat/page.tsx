import type { Metadata } from "next";
import Image from "next/image";
import { ChatRoom } from "./chat-room";
import "../noir.css";

export const metadata: Metadata = {
  title: "Chat with Milli — Milli Milli",
  description: "Ask about the menu, reservations or anything else about your visit.",
};

export default function ChatPage() {
  return (
    <div className="noir">
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        <Image
          src="/img/milli/room-niche.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[65%_45%] grayscale-[35%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(13,8,9,0.96)_0%,rgba(13,8,9,0.8)_38%,rgba(13,8,9,0.25)_72%,rgba(13,8,9,0.45)_100%)] max-md:bg-[linear-gradient(180deg,rgba(13,8,9,0.55)_0%,rgba(13,8,9,0.92)_100%)]"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-32 pb-14 md:px-10 md:pt-44 md:pb-20">
          <p className="noir-label text-cream/70">The concierge &nbsp;·&nbsp; Open all evening</p>
          <h1 className="mt-5 font-display text-[clamp(3.6rem,9vw,7rem)] leading-[0.92] font-normal tracking-[-0.015em]">
            Ask
            <br />
            <em className="text-cream/80">Milli.</em>
          </h1>
          <hr className="mt-8 mb-6 w-16 border-0 border-t border-cream/60" />
          <p className="max-w-sm font-display text-[19px] leading-relaxed text-cream/85">
            The menu, a table for tonight, what to drink with what. Ask the way you&apos;d ask your
            waiter.
          </p>
        </div>
      </section>

      <ChatRoom />
    </div>
  );
}
