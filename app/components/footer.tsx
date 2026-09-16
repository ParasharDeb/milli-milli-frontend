import { Reveal } from "./reveal";

const COLUMNS = [
  {
    title: "Visit",
    links: ["Menu", "The kitchen", "The room", "Private dining", "Gift cards"],
  },
  {
    title: "More",
    links: ["Journal", "Press kit", "Suppliers", "Work with us", "Stockists"],
  },
];

const HOURS = [
  ["Wed – Thu", "19:00 – 23:00"],
  ["Fri – Sat", "18:30 – 00:00"],
  ["Sunday", "13:00 – 17:00"],
  ["Mon – Tue", "Closed"],
];

export function Footer() {
  return (
    <footer className="grain relative bg-forest-deep text-cream">
      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-20 md:px-10">
        <Reveal y={20}>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.1fr]">
            <div>
              <p className="flex items-baseline gap-2 font-display text-3xl lowercase">
                milli
                <span className="h-2 w-2 rounded-full bg-ember" />
              </p>
              <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-cream/60 text-pretty">
                A twelve-table kitchen on Rua das Flores, cooking whatever the
                Lisbon market gave us that morning.
              </p>
              <div className="mt-7 flex gap-2.5">
                {["Instagram", "Substack", "TheFork"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="rounded-full border border-cream/20 px-4 py-2 text-[12px] transition-colors hover:border-amber hover:text-amber"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] tracking-[0.22em] text-cream/45 uppercase">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3 text-[15px]">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-cream/75 transition-colors hover:text-amber"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-[11px] tracking-[0.22em] text-cream/45 uppercase">
                Hours
              </p>
              <dl className="mt-5 space-y-3 text-[15px]">
                {HOURS.map(([day, time]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <dt className="text-cream/75">{day}</dt>
                    <dd
                      className={
                        time === "Closed" ? "text-cream/35" : "text-cream/90"
                      }
                    >
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
              <address className="mt-6 text-[14px] leading-relaxed text-cream/60 not-italic">
                Rua das Flores 14
                <br />
                1200-194 Lisboa, Portugal
              </address>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-cream/12 pt-8 text-[12px] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Milli. Everything on the menu may change before you arrive.</p>
            <ul className="flex flex-wrap gap-6">
              {["Privacy", "Terms", "Allergens", "Accessibility"].map((l) => (
                <li key={l}>
                  <a href="#" className="transition-colors hover:text-cream">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
