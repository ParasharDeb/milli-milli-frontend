import { ArrowLink, Note, Print } from "./ui";

const CATEGORIES = ["Seasonal ingredients", "Signature cocktails", "Shared plates", "Late night bites"];

export function TableSection() {
  return (
    <section id="the-table" className="mm-table mm-paper" aria-labelledby="table-title">
      <div className="mm-table__media">
        <Print
          className="mm-table__plate"
          src="/img/milli/dish-seabass.webp"
          alt="Crisp-skinned sea bass on a stoneware plate, a candle burning behind it"
          sizes="(max-width: 899px) 86vw, 44vw"
          focus="50% 55%"
        />
        <Print
          className="mm-table__glass"
          src="/img/wine-pour.webp"
          alt="An amber pour into a wine glass by candlelight"
          sizes="(max-width: 899px) 52vw, 25vw"
          focus="62% 60%"
        />
        <Note className="mm-table__note" lines={["One more?"]} />
      </div>

      <div className="mm-table__text">
        <h2 id="table-title" className="mm-display mm-h2">
          Food, drinks
          <br />
          and everything
          <br />
          in between.
        </h2>
        <div className="mm-table__body">
          <p className="mm-copy">
            A menu built for long conversations, later rounds and nights that don&rsquo;t follow a
            schedule.
          </p>
          <ArrowLink href="/reserve-table" underline>
            Reserve a table
          </ArrowLink>
        </div>
      </div>

      <ul className="mm-table__cats mm-micro" aria-label="On the table">
        {CATEGORIES.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  );
}
