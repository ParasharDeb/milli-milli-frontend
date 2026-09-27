import type { Metadata } from "next";
import { ChatRoom } from "./chat-room";

export const metadata: Metadata = {
  title: "Ask the pass — Milli",
  description:
    "Ask about tonight's dishes, what is vegetarian and how hot things run.",
};

export default function ChatPage() {
  return <ChatRoom />;
}
