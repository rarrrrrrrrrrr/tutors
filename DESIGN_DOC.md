# Tutor & Student Matchmaker — Design Document

## Overview
This is a lightweight client-side web app for matching students with tutors using local browser storage. Users can sign up and log in as either a tutor or a student. Tutors create public tutor profiles, while student profiles remain private and are only used to recommend tutors.

## Goals
- Keep the homepage uncluttered and focused on student summary + tutor recommendations
- Move authentication (login/signup) to dedicated pages
- Consolidate profile creation and editing into modal dialogs
- Preserve student privacy by not exposing student profile details publicly
- Allow users to view and update their profile after login
- Implement role-based behavior for tutors and students

## Technology Stack
- HTML5 for structure
- CSS for layout and styling
- Vanilla JavaScript for application logic
- `sessionStorage` for session management
- Azure Table Storage (via API) for persistence

## UI Structure
### Main page (index.html)
- Header with links/buttons:
  - `Tutor login` (links to login.html)
  - `Student login` (links to login.html)
  - `Sign up` (links to signup.html)
  - `My profile` (visible when logged in)
  - `Logout` (visible when logged in)
  - Login status text
- Section: `Your student profile`
  - Private student summary card
- Section: `Recommended tutors`
  - Tutor recommendation feed based on the most recent saved student profile

### Auth Pages
#### Login Page (login.html)
- Clean, focused login form
- Role selection (tutor/student)
- Links to signup

#### Signup Page (signup.html)
- Full registration form
- Role-specific fields displayed dynamically
- Links to login

### Modals
#### Profile modal (in index.html)
- Visible only after login
- Allows editing and saving profile fields
- `Email` is shown but disabled
- Role-specific fields displayed dynamically:
  - Tutors can edit tutor-specific profile fields and photo
  - Students can edit student-specific learning interests

## App Behavior
### Authentication
- Sign up creates a user account and saves a first profile
- Login authenticates against stored accounts
- `currentUser` stores session state in `sessionStorage`
- Logging out clears `sessionStorage`

### Profile persistence
- Profiles are saved to Azure Table Storage via the `/api/tutors` and `/api/students` routes.
- Each profile is linked by `ownerId`
- `My profile` modal opens the logged-in user's profile for editing

## Component Responsibilities
### `utils.js`
- Shared core functions (API calls, session management, profile loading)

### `script.js`
- Dashboard-specific logic (rendering tutor table, student summary, and matches)
- Profile modal management

### `login.js` & `signup.js`
- Page-specific authentication logic

### `index.html`, `login.html`, `signup.html`
- Page markup and structures

## Privacy Considerations
- Student profile details are not shown in public tutor listings
- Only tutor profiles appear in the public recommendation feed
- The student summary is only visible to the current visitor

## Future Improvements
- Add backend persistence and secure authentication
- Hash or salt stored passwords
- Add explicit profile deletion and edit history
- Add tutor search filters and sorting
- Add user sessions with expiration
- Improve UI/UX with better responsive design and animations

## Open Questions
- Should the app allow multiple student profiles per user or only one?
- Should the match logic prioritize tutors by topic count or recency?
- Should user roles be allowed to change after signup?
