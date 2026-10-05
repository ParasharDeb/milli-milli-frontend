import Image from "next/image";

const MOMENTS = [
  { time: "19:42", label: ["Dinner"] },
  { time: "21:16", label: ["Another", "round"] },
  { time: "22:48", label: ["The music", "gets louder"] },
  { time: "00:17", label: ["The night", "takes over"] },
];

export function EveningTimeline() {
  return (
    <section className="mm-evening mm-grain" aria-labelledby="evening-title">
      <Image
        className="mm-evening__photo"
        src="/img/room-pass.webp"
        alt=""
        fill
        sizes="100vw"
        style={{ objectPosition: "50% 38%" }}
      />
      <div className="mm-evening__shade" aria-hidden />

      <div className="mm-evening__inner">
        <h2 id="evening-title" className="mm-label mm-evening__title">
          An evening at Milli Milli
        </h2>
        <ol className="mm-evening__line">
          {MOMENTS.map((m) => (
            <li key={m.time}>
              <span className="mm-evening__dot" aria-hidden />
              <time className="mm-evening__time">{m.time}</time>
              <span className="mm-evening__what">
                {m.label.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
