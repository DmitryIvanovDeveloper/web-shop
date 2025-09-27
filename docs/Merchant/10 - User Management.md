### Overview
Manage user roles in the admin panel.

Preconditions:
- User is logged in
- Has permission to change roles

Scenario (USER ACTION => SYSTEM REACTIONS):
1. User opens the user list =>
  - Roles and statuses are displayed
2. User changes a user's role =>
  - Role switches to the selected level (admin/viewer)

Expected Final State:
- User's role updated; permissions applied
