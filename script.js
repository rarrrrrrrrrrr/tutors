const studentSummary = document.getElementById('studentSummary');
const studentFeed = document.getElementById('studentFeed');
const tutorTableWrapper = document.getElementById('tutorTableWrapper');
const tutorTableBody = document.getElementById('tutorTableBody');
const loginTutorButton = document.getElementById('loginTutorButton');
const loginStudentButton = document.getElementById('loginStudentButton');
const signupButton = document.getElementById('signupButton');
const profileButton = document.getElementById('profileButton');
const logoutButton = document.getElementById('logoutButton');
const loginStatus = document.getElementById('loginStatus');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const profileForm = document.getElementById('profileForm');
const profileModalTitle = document.getElementById('profileModalTitle');
const profileMessage = document.getElementById('profileMessage');
const profileNameInput = document.getElementById('profileName');
const profileEmailInput = document.getElementById('profileEmail');
const profilePronounsInput = document.getElementById('profilePronouns');
const profileGradeInput = document.getElementById('profileGrade');
const profileSchoolInput = document.getElementById('profileSchool');
const profileWageInput = document.getElementById('profileWage');
const profileTutorScheduleInput = document.getElementById('profileTutorSchedule');
const profileTutorBioInput = document.getElementById('profileTutorBio');
const profilePhotoInput = document.getElementById('profilePhoto');
const profileTutorFields = document.getElementById('profileTutorFields');
const profileStudentFields = document.getElementById('profileStudentFields');

function renderLoginState() {
  const user = getCurrentUser();

  if (!user) {
    loginStatus.textContent = '';
    logoutButton.classList.add('hidden');
    profileButton.classList.add('hidden');
    loginTutorButton.classList.remove('hidden');
    loginStudentButton.classList.remove('hidden');
    signupButton.classList.remove('hidden');
    return;
  }

  loginStatus.textContent = `Logged in as ${user.role} • ${user.name}`;
  logoutButton.classList.remove('hidden');
  profileButton.classList.remove('hidden');
  loginTutorButton.classList.add('hidden');
  loginStudentButton.classList.add('hidden');
  signupButton.classList.add('hidden');
}

function handleLogout() {
  clearCurrentUser();
  renderLoginState();
  renderTutorTable();
}

async function openProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }
  profileForm.reset();
  profileMessage.textContent = '';
  profileModalTitle.textContent = user.role === 'tutor' ? 'Edit tutor profile' : 'Edit student profile';
  profileNameInput.value = user.name;
  profileEmailInput.value = user.email;
  showProfileFields(user.role);
  const profile = await getProfileByOwnerId(user.role, user.id);
  populateProfileForm(user.role, profile);
  profileModal.classList.remove('hidden');
  profileNameInput.focus();
}

function closeProfile() {
  profileModal.classList.add('hidden');
  profileForm.reset();
  profileMessage.textContent = '';
}

function showProfileFields(role) {
  const showTutor = role === 'tutor';
  const showStudent = role === 'student';
  profileTutorFields.classList.toggle('hidden', !showTutor);
  profileStudentFields.classList.toggle('hidden', !showStudent);
  Array.from(profileTutorFields.querySelectorAll('input, select, textarea')).forEach(input => {
    input.disabled = !showTutor;
  });
  Array.from(profileStudentFields.querySelectorAll('input, select, textarea')).forEach(input => {
    input.disabled = !showStudent;
  });
}

function populateProfileForm(role, profile) {
  profilePronounsInput.value = profile?.pronouns || '';
  profileGradeInput.value = profile?.grade || '';
  profileSchoolInput.value = profile?.school || '';
  if (role === 'tutor') {
    profileWageInput.value = profile?.wage || '';
    profileTutorScheduleInput.value = profile?.schedule || '';
    profileTutorBioInput.value = profile?.bio || '';
    document.querySelectorAll('input[name="profileTopics"]').forEach(input => {
      input.checked = profile?.topics?.includes(input.value) || false;
    });
  }
  if (role === 'student') {
    document.querySelectorAll('input[name="profileStudentTopics"]').forEach(input => {
      input.checked = profile?.topics?.includes(input.value) || false;
    });
  }
}

async function renderTutorTable() {
  const tutors = await loadProfiles(STORAGE_TUTORS);
  tutorTableBody.innerHTML = '';

  if (!tutors.length) {
    tutorTableBody.innerHTML = '<tr><td colspan="8" class="empty-state">No tutor profiles saved yet. Any registered tutor can add a profile by logging in and saving their information.</td></tr>';
    return;
  }

  tutors.forEach(profile => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${profile.photo ? `<img src="${profile.photo}" alt="${profile.name} photo" class="table-avatar" />` : ''}</td>
      <td>${profile.name || ''}</td>
      <td>${profile.ownerEmail || ''}</td>
      <td>${profile.pronouns || ''}</td>
      <td>${profile.grade || ''}</td>
      <td>${profile.school || ''}</td>
      <td>${Array.isArray(profile.topics) ? profile.topics.join(', ') : ''}</td>
      <td>${profile.wage || ''}</td>
    `;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      window.location.href = `detail.html?type=tutor&id=${encodeURIComponent(profile.id)}`;
    });
    tutorTableBody.appendChild(row);
  });
}

profileButton.addEventListener('click', openProfileModal);
logoutButton.addEventListener('click', handleLogout);
closeProfileModal.addEventListener('click', closeProfile);
profileModal.addEventListener('click', event => {
  if (event.target === profileModal) {
    closeProfile();
  }
});

profileForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    return;
  }
  const role = user.role;
  const existing = await getProfileByOwnerId(role, user.id);
  const profile = existing || {
    id: generateId(role),
    ownerId: user.id,
    ownerEmail: user.email,
    createdAt: new Date().toISOString(),
  };

  profile.name = profileNameInput.value.trim();
  profile.pronouns = profilePronounsInput.value.trim();
  profile.grade = profileGradeInput.value;
  profile.school = profileSchoolInput.value.trim();
  profile.updatedAt = new Date().toISOString();

  if (role === 'tutor') {
    profile.topics = getCheckedTopics(profileForm, 'profileTopics');
    profile.wage = profileWageInput.value.trim();
    profile.schedule = profileTutorScheduleInput.value.trim();
    profile.bio = profileTutorBioInput.value.trim();
    const photoFile = profilePhotoInput.files[0];
    profile.photo = photoFile ? await readImage(photoFile) : profile.photo || '';
    await upsertProfile(STORAGE_TUTORS, profile);
  } else {
    profile.topics = getCheckedTopics(profileForm, 'profileStudentTopics');
    await upsertProfile(STORAGE_STUDENTS, profile);
  }

  const newName = profileNameInput.value.trim();
  if (newName !== user.name) {
    try {
      const updated = await apiFetch('/auth/update-name', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, role: user.role, name: newName }),
      });
      if (updated) {
        // We need a way to update the user in the session
        sessionStorage.setItem('currentUser', JSON.stringify(updated));
        renderLoginState();
      }
    } catch (err) {
      console.error('Failed to update user name:', err);
    }
  }

  profileMessage.textContent = 'Profile saved successfully.';
  renderTutorTable();
  setTimeout(closeProfile, 1200);
});

// Initial load
renderLoginState();
renderTutorTable();
