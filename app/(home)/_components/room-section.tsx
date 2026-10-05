import { ArrowLink, Note, Print } from "./ui";

export function RoomSection() {
  return (
    <section id="the-room" className="mm-room" aria-labelledby="room-title">
      <div className="mm-room__text">
        <p className="mm-label">The Room</p>
        <h2 id="room-title" className="mm-display mm-h2">
          A space
          <br />
          that changes
          <br />
          with the night.
        </h2>
        <p className="mm-copy">
          Warm lights, textured walls,
          <br className="mm-desk" /> intimate corners and a setting
          <br className="mm-desk" /> that feels different every hour.
        </p>
        <ArrowLink href="/reserve-table">Explore the space</ArrowLink>
      </div>

      <div className="mm-room__media">
        <Print
          className="mm-room__main mm-grain"
          src="/img/milli/room-niche.webp"
          alt="A banquette between two linen floor lamps, carved niches lit along the wall"
          sizes="(max-width: 899px) 92vw, 43vw"
          focus="52% 50%"
        />
        <Print
          className="mm-room__inset"
          src="/img/milli/bar-indoor.webp"
          alt="Guests at the glowing quartz bar"
          sizes="(max-width: 899px) 48vw, 22vw"
          focus="36% 60%"
        />
        <Note className="mm-room__note" lines={["Same place.", "Different night."]} />
      </div>
    </section>
  );
}
