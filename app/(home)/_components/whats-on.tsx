import Link from "next/link";
import { Arrow, ArrowLink, Note, Print } from "./ui";

/** Not a programme: the three ways an evening here usually goes. */
const RHYTHM = [
  {
    verb: "Eat",
    where: "The kitchen",
    title: "Plates made for sharing",
    detail: "Small, generous, passed around",
    href: "/menu",
  },
  {
    verb: "Drink",
    where: "The bar",
    title: "Signature cocktails",
    detail: "And the round after that",
    href: "/menu",
  },
  {
    verb: "Stay",
    where: "The lounge",
    title: "Corners for long conversations",
    detail: "Two of you or the whole table",
    href: "/reserve-table",
  },
];

export function WhatsOn() {
  return (
    <section id="every-night" className="mm-on mm-paper" aria-labelledby="on-title">
      <div className="mm-on__text">
        <h2 id="on-title" className="mm-display mm-h2">
          Good food.
          <br />
          Great music.
          <br />
          Interesting <em>people.</em>
        </h2>
        <ArrowLink href="/chat" underline>
          Ask Milli what&rsquo;s good
        </ArrowLink>
      </div>

      <div className="mm-on__media">
        <Print
          className="mm-on__one"
          src="/img/room-hearth.webp"
          alt="Fish and peppers over the open fire"
          sizes="(max-width: 899px) 50vw, 16vw"
          focus="60% 50%"
        />
        <Print
          className="mm-on__two"
          src="/img/milli/chef.webp"
          alt="The kitchen mid-service"
          sizes="(max-width: 899px) 50vw, 16vw"
        />
        <Note className="mm-on__note" lines={["Good food.", "Louder music.", "interesting people."]} />
      </div>

      <ul className="mm-on__events">
        {RHYTHM.map((r) => (
          <li key={r.verb}>
            <Link href={r.href} className="mm-event">
              <span className="mm-event__when">
                <b>{r.verb}</b>
                <span>{r.where}</span>
              </span>
              <span className="mm-event__what">
                <b>{r.title}</b>
                <span>{r.detail}</span>
              </span>
              <Arrow short />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
