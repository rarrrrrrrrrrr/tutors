# Tutor & Student Matchmaker — Design Document

## Overview
This is a lightweight client-side web app for matching students with tutors using local browser storage. Users can sign up and log in as either a tutor or a student. Tutors create public tutor profiles, while student profiles remain private and are only used to recommend tutors.

## Goals
- Keep the homepage uncluttered and focused on student summary + tutor recommendations
- Consolidate all profile creation and editing into modal dialogs
- Preserve student privacy by not exposing student profile details publicly
- Allow users to view and update their profile after login
- Implement role-based behavior for tutors and students

## Technology Stack
- HTML5 for structure
- CSS for layout and styling
- Vanilla JavaScript for application logic
- `localStorage` for persistence

## Data Model
### Storage keys
- `userAccounts` — saved user accounts
- `currentUser` — currently logged-in user session
- `tutorProfiles` — saved tutor profiles
- `studentProfiles` — saved student profiles

### User object
- `id` — unique user ID
- `name` — account name
- `email` — email address
- `password` — plain text password (for this prototype only)
- `role` — `tutor` or `student`

### Profile object (tutor)
- `id` — tutor profile ID
- `ownerId` — user ID of profile owner
- `ownerEmail` — user email
- `name` — display name
- `pronouns`
- `grade`
- `school`
- `wage`
- `topics` — array of topics tutored
- `photo` — Base64 data URL
- `createdAt`
- `updatedAt`

### Profile object (student)
- `id` — student profile ID
- `ownerId`
- `ownerEmail`
- `name`
- `pronouns`
- `grade`
- `school`
- `topics` — array of topics desired
- `createdAt`
- `updatedAt`

## UI Structure
### Main page
- Header with buttons:
  - `Tutor login`
  - `Student login`
  - `My profile` (visible when logged in)
  - `Logout` (visible when logged in)
  - Login status text
- Section: `Your student profile`
  - Private student summary card
- Section: `Recommended tutors`
  - Tutor recommendation feed based on the most recent saved student profile

### Modals
#### Login / Signup modal
- Supports both login and sign-up flows
- Role-specific signup fields:
  - Tutor: pronouns, grade, school, topics, wage, photo
  - Student: pronouns, grade, school, desired topics
- Toggle between login and signup

#### Profile modal
- Visible only after login
- Allows editing and saving profile fields
- `Email` is shown but disabled
- Role-specific fields displayed dynamically:
  - Tutors can edit tutor-specific profile fields and photo
  - Students can edit student-specific learning interests

## App Behavior
### Authentication
- Sign up creates a `userAccounts` entry and saves a first profile
- Login authenticates against stored accounts by email, role, and password
- `currentUser` stores session state in `localStorage`
- Logging out clears `currentUser`

### Profile persistence
- Tutors save to `tutorProfiles`
- Students save to `studentProfiles`
- Each profile is linked by `ownerId`
- `My profile` modal opens the logged-in user's profile for editing

### Recommendation logic
- The tutor feed is generated from the latest student profile
- Tutors are matched if their topics overlap with the student's topics
- The feed updates when a student profile is created or edited

## Component Responsibilities
### `script.js`
- DOM wiring and event listeners
- Local storage access helpers
- Login/signup flow control
- Role-specific form updates
- Profile save and load logic
- Rendering student summary and tutor feed

### `index.html`
- Page markup
- Modal structure for login/signup and profile editing
- UI controls for user actions

### `styles.css`
- Responsive page layout
- Modal styling and visibility
- Profile cards, buttons, and forms

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
