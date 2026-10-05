import { HeroSlides } from "./hero-slides";
import { ArrowLink } from "./ui";

export function Hero() {
  return (
    <section className="mm-hero mm-grain" aria-labelledby="hero-title">
      <HeroSlides />
      <div className="mm-hero__shade" aria-hidden />

      <div className="mm-hero__copy">
        <p className="mm-label mm-hero__eyebrow">
          Good food.
          <br />
          Longer nights.
        </p>
        <h1 id="hero-title" className="mm-display mm-hero__title">
          Dinner
          <br />
          is only the
          <br />
          beginning.
        </h1>
        <hr className="mm-rule mm-hero__rule" />
        <ArrowLink href="/menu">Show menu</ArrowLink>
      </div>
    </section>
  );
}
