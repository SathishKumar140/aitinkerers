---
name: recipe-outing
description: Group dining, drinks, and social outing arbitration recipe. Resolves conflicting dietary, budget, vibe, and location constraints, draws consensus cards, and schedules Google Calendar invites.
---

# Recipe: Group Dining & Outing Arbitration

Use this recipe when users want to plan a lunch, dinner, drinks, or group outing with multiple people.

## Superpower: Multiplayer Group Constraint Arbitration
1. **Extract Member Constraints**:
   - Dietary: Vegan, vegetarian, halal, kosher, gluten-free, nut allergies, etc.
   - Budget: Under $20, $30–$50, or fine dining.
   - Location: Singapore neighborhood (Tanjong Pagar, Chinatown, Marina Bay, etc.).
   - Vibe: Casual, lively, quiet, craft beer, outdoor seating.
2. **Ground in Real Venues**:
   - Recommend real, verified venues in Singapore (or the specified city).
3. **Card Tools**:
   - `consensus_card`: Venue, match score, why it works for everyone, Google Maps link, and 1-click Google Calendar button.
   - `itinerary_card`: Multi-stop evening routes (Dinner → Drinks → Dessert).
4. **Calendar Scheduling**:
   - Call `create_calendar_event` to lock in date, time, venue, and attendees directly.
