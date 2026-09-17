 # AI Restaurant Concierge: Requested Features

## Summary

| # | Feature | Category |
|---|---|---|
| 1 | Cuisine-based group meal suggestion | Discovery |
| 2 | Mixed-preference group order builder | Ordering |
| 3 | Group drinks recommendation | Drinks |
| 4 | Drink and shisha pairing | Pairing |
| 5 | General pairing (food, drink, shisha) | Pairing |
| 6 | Most favourite and popular orders | Discovery |
| 7 | Order placement | Ordering |
| 8 | Second-order suggestions | Upsell |
| 9 | Review and feedback collection | Post-meal |
| 10 | Personalised suggestions from guest history | Personalisation |

---

## 1. Cuisine-Based Group Meal Suggestion

**Example:** "Suggest the best Chinese meal to fill a group of 5"

**What it does**
- Filters the menu by cuisine.
- Calculates the total quantity needed from each dish's "serves" value and the headcount.
- Covers every course: starter, main, rice or noodles, side, and dessert.
- Gives 2–3 options (Value, Balanced, Premium) with the total price.

**Needs:** menu tagged by cuisine, portion size, course type, and price.

---

## 2. Mixed-Preference Group Order Builder

**Example:** "Group of 5: 2 vegetarians, some want Chinese, some want Italian"

**What it does**
- Captures each person's preference: veg or non-veg, cuisine, spice level, and exclusions.
- Splits the order into shared dishes and individual plates.
- Makes sure veg dishes are enough for all vegetarians.
- Detects mismatched counts. If preferences add up to 7 for a group of 5, it asks which ones overlap instead of guessing.
- Returns one combined order with a per-person view.

**Needs:** diet tags (veg, Jain, vegan), cuisine tags, portion size, and an allergen list.

---

## 3. Group Drinks Recommendation

**Example:** "Group of 7 wanting to get drunk, suggest the best drinks"

**What it does**
- Suggests value formats for groups: pitchers, towers, buckets, and shot rounds.
- Plans drinks in rounds with the price per head.
- Adds water or mocktail rounds in between for pacing.
- Checks legal drinking age, offers a cab at the end, and alerts staff if consumption looks excessive.

**Needs:** bar menu with serving sizes and group formats, plus responsible-service rules.

---

## 4. Drink and Shisha Pairing

**Example:** "Best drink to pair with the best shisha"

**What it does**
- Recommends the top shisha by popularity or rating.
- Pairs drinks by flavour profile: fresh flavours with citrus or mint drinks, sweet flavours with creamy or fruity drinks, spiced flavours with dark spirits or cold brew.
- Offers alcoholic and non-alcoholic options.

**Needs:** shisha flavour profiles and drink flavour tags.

---

## 5. General Pairing Engine

**Example:** "What goes with this?"

**What it does**
- Pairs food with drinks, food with shisha, drinks with shisha, or all three together.
- Works from any starting item the guest picks.
- Explains each pairing in one line.

**Needs:** pairing links in the menu data, curated by the chef or bar team.

---

## 6. Most Favourite and Popular Orders

**Example:** "What's most ordered here?"

**What it does**
- Lists bestsellers by category: food, drinks, shisha.
- Can filter by time (today, this week) and by group type (couples, large groups).
- Includes the chef's signature dishes.

**Needs:** POS sales data and a signature-dish flag.

---

## 7. Order Placement

**Example:** "Place my order"

**What it does**
- Builds a cart with item notes (less spicy, no onion, Jain).
- Shows a summary and bill preview for the guest to confirm.
- Sends a draft KOT to the captain app for staff confirmation.
- Updates the guest on order status (received, preparing, served).
- Allows changes or cancellation until the kitchen starts cooking.

**Needs:** POS/captain app integration, live stock, and a sold-out (86) list.

---

## 8. Second-Order Suggestions

**Example:** Suggestions based on the first order

**What it does**
- Reads what is already on the table and finds gaps. For example, only dry starters means it suggests a gravy and rice or noodles.
- Suggests the next drinks round, a dessert, or a shisha refill or flavour change.
- Times suggestions: when plates are nearly empty, before the kitchen closes, or before happy hour ends.

**Needs:** the table's current order, meal-timing rules, and pairing data.

---

## 9. Review and Feedback Collection

**Example:** Asking for feedback

**What it does**
- Triggers after the bill is settled.
- Collects a 1-tap overall rating, dish-level ratings, and optional comments or a voice note.
- Low rating: instantly alerts the GM or owner with table, order, and staff details, and offers the guest a recovery gesture.
- High rating: sends the Google review link.

**Needs:** bill-closed trigger from the POS and an escalation contact list.

---

## 10. Personalised Suggestions from Guest History

**Example:** "Welcome back, want your usual?"

**What it does**
- Recognises the guest from the phone number captured at seating.
- Recalls favourite dishes, drinks, and shisha flavours.
- Offers a one-tap "repeat last order".
- Suggests new items similar to past favourites.
- Remembers dietary notes, allergies, and occasions (birthdays, anniversaries).

**Needs:** guest profile linked to order history, and a consent opt-in (DPDP Act).

---

## Features by Journey Stage

| Stage | Features |
|---|---|
| Seated / browsing | 1, 6, 10 |
| Deciding | 2, 3, 4, 5 |
| Ordering | 7 |
| Mid-meal | 8 |
| After the meal | 9 |
