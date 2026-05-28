const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loginRoleInput = document.getElementById('loginRole');

// Extract role from URL if present
const urlParams = new URLSearchParams(window.location.search);
const initialRole = urlParams.get('role');
if (initialRole && (initialRole === 'tutor' || initialRole === 'student')) {
  loginRoleInput.value = initialRole;
}

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const role = formData.get('role');
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');

  if (!email || !password) {
    loginMessage.textContent = 'Please complete all required fields.';
    return;
  }

  const user = await authenticateUser({ email, password, role });
  if (!user) {
    loginMessage.textContent = 'Incorrect email or password for this role.';
    return;
  }

  // Handle tutor login specific logic (updating lastLoginAt)
  if (role === 'tutor') {
    const profiles = await loadProfiles(STORAGE_TUTORS);
    const tutorProfile = profiles.find(p => p.ownerId === user.id);
    if (tutorProfile) {
      tutorProfile.lastLoginAt = new Date().toISOString();
      await upsertProfile(STORAGE_TUTORS, tutorProfile);
    }
  }

  setCurrentUser(user);
  window.location.href = 'index.html';
});
