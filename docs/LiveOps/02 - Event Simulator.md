### Overview
Simulate incoming events to test automation logic.

Preconditions:
- User is logged in
- Access to LiveOps module

Scenario (USER ACTION => SYSTEM REACTIONS):
1. User triggers sample events (session_start, add_to_cart, purchase, etc.) =>
  - System acknowledges event processing

Expected Final State:
- Events are simulated and visible in the test log
