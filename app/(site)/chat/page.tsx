import type { Metadata } from "next";
import Image from "next/image";
import { ChatRoom } from "./chat-room";

export const metadata: Metadata = {
  title: "Chat with Milli — Milli Milli",
  description: "Ask about the menu, reservations or anything else about your visit.",
};

export default function ChatPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        <Image
          src="/img/milli/room-niche.webp"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[65%_45%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,14,10,0.95)_0%,rgba(20,14,10,0.78)_35%,rgba(20,14,10,0.2)_70%,rgba(20,14,10,0.35)_100%)] max-md:bg-[linear-gradient(180deg,rgba(20,14,10,0.5)_0%,rgba(20,14,10,0.9)_100%)]"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pt-32 pb-14 md:px-10 md:pt-40 md:pb-20">
          <h1 className="font-display text-[clamp(3.4rem,8vw,6.6rem)] leading-[0.95] font-light">
            Chat with
            <br />
            <span className="text-ember">Milli.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-cream/85">
            Ask about the menu, reservations or anything else. I&apos;m here to help.
          </p>
        </div>
      </section>

      <ChatRoom />
    </>
  );
}
