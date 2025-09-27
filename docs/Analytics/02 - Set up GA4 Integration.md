### Overview
Connect Google Analytics 4 to collect behavioral data.

Preconditions:
- User is logged in
- GA4 credentials/keys are available

Scenario (USER ACTION => SYSTEM REACTIONS):
1. User selects analytics service and enters keys =>
  - System validates the provided data
2. User sets sync frequency and timezone =>
  - System saves synchronization settings
3. User confirms connection =>
  - System reports a successful connection and readiness to collect data

Expected Final State:
- GA4 integration is connected; sync parameters recorded
