/**
 * Recognises "place the order" in the guest's own words -- "yes order this for
 * me", "place my order", "checkout", "go ahead and order it" -- so the chat can
 * place it rather than sending it to the backend, which only knows how to add
 * dishes.
 *
 * A message counts only when every word in it is filler, a reference to what
 * was just shown, or an ordering verb. Anything else -- a dish name, a question
 * -- means the guest is saying something more, and the backend should hear it:
 * "order the paneer tikka" is an add, not a checkout.
 */

const VERBS = new Set(["order", "place", "confirm", "checkout", "proceed", "buy", "submit", "finalise", "finalize"]);

/** Words that point back at the dish or dishes the reply just showed. */
const REFS = new Set(["this", "that", "it", "these", "those", "them", "one"]);

const FILLER = new Set([
  "yes", "yeah", "yep", "yup", "ya", "ok", "okay", "sure", "alright", "fine", "great", "perfect", "cool",
  "please", "pls", "plz", "thanks", "thank", "you", "go", "ahead", "just", "now", "then", "and", "so",
  "for", "me", "my", "the", "a", "an", "to", "i", "i'd", "id", "i'll", "ill", "want", "would", "like",
  "can", "could", "will", "do", "let's", "lets", "us", "we", "our", "all", "everything", "whole",
  "cart", "food", "out", "check", "it's", "that's", "thats", "sounds", "good", "looks", "is", "be",
]);

export type OrderIntent = { refersToShown: boolean };

export function orderIntent(text: string): OrderIntent | null {
  const words = text.toLowerCase().match(/[a-z']+/g);
  if (!words) return null;

  let verb = false;
  let refersToShown = false;
  for (const w of words) {
    if (VERBS.has(w)) verb = true;
    else if (REFS.has(w)) refersToShown = true;
    else if (!FILLER.has(w)) return null;
  }
  // "check out" is the verb in two words.
  if (!verb && words.includes("check") && words.includes("out")) verb = true;
  return verb ? { refersToShown } : null;
}
