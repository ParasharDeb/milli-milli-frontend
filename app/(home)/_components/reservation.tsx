import Image from "next/image";
import { Note } from "./ui";

// Must match the slots the /reserve-table form accepts.
const TIMES = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
const GUESTS = [1, 2, 3, 4, 5, 6, 7, 8];

const Chevron = () => (
  <svg className="mm-field__icon" viewBox="0 0 12 8" fill="none" aria-hidden>
    <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const Calendar = () => (
  <svg className="mm-field__icon" viewBox="0 0 14 14" fill="none" aria-hidden>
    <rect x="1.5" y="2.5" width="11" height="10" stroke="currentColor" />
    <path d="M1.5 5.5h11M4.5 1v3M9.5 1v3M5 8.5h1M8 8.5h1M5 10.5h1" stroke="currentColor" />
  </svg>
);

/**
 * The closing booking bar. It hands its choices to /reserve-table in the query
 * string, where the full form takes the name and phone number.
 */
export function Reservation() {
  return (
    <section id="reserve" className="mm-reserve mm-grain" aria-labelledby="reserve-title">
      <Image
        className="mm-reserve__photo"
        src="/img/table-night.webp"
        alt=""
        fill
        sizes="100vw"
        style={{ objectPosition: "38% 50%" }}
      />
      <div className="mm-reserve__shade" aria-hidden />

      <div className="mm-reserve__text">
        <p className="mm-label">Milli Milli</p>
        <h2 id="reserve-title" className="mm-display mm-reserve__title">
          Come for dinner.
          <br />
          Stay for whatever
          <br />
          happens next.
        </h2>
        <Note className="mm-reserve__note" lines={["Let’s see", "where this goes."]} />
      </div>

      <form className="mm-form" action="/reserve-table" method="get" aria-label="Reserve a table">
        <p className="mm-label mm-form__title">Reserve a table</p>

        <label className="mm-field">
          <span className="mm-field__name">Date</span>
          <input type="date" name="date" required />
          <Calendar />
        </label>

        <label className="mm-field">
          <span className="mm-field__name">Time</span>
          <select name="time" required defaultValue="">
            <option value="" disabled hidden />
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Chevron />
        </label>

        <label className="mm-field">
          <span className="mm-field__name">Guests</span>
          <select name="guests" required defaultValue="">
            <option value="" disabled hidden />
            {GUESTS.map((g) => (
              <option key={g} value={g}>
                {g} {g === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
          <Chevron />
        </label>

        <button type="submit" className="mm-form__submit">
          Reserve a table
        </button>
      </form>
    </section>
  );
}
