const studentSummary = document.getElementById('studentSummary');
const studentFeed = document.getElementById('studentFeed');
const tutorTableWrapper = document.getElementById('tutorTableWrapper');
const tutorTableBody = document.getElementById('tutorTableBody');
const loginTutorButton = document.getElementById('loginTutorButton');
const loginStudentButton = document.getElementById('loginStudentButton');
const profileButton = document.getElementById('profileButton');
const logoutButton = document.getElementById('logoutButton');
const loginStatus = document.getElementById('loginStatus');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');
const loginRoleInput = document.getElementById('loginRole');
const loginModalTitle = document.getElementById('loginModalTitle');
const loginNameInput = document.getElementById('loginName');
const loginNameWrapper = document.getElementById('loginNameWrapper');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginConfirmPasswordInput = document.getElementById('loginConfirmPassword');
const loginMessage = document.getElementById('loginMessage');
const toggleLoginMode = document.getElementById('toggleLoginMode');
const loginSubmitButton = document.getElementById('loginSubmitButton');
const loginSwitchMessage = document.getElementById('loginSwitchMessage');
const tutorSignupFields = document.getElementById('tutorSignupFields');
const studentSignupFields = document.getElementById('studentSignupFields');
const loginPhotoInput = document.getElementById('loginPhoto');
const loginTutorWageInput = document.getElementById('loginTutorWage');
const loginTutorScheduleInput = document.getElementById('loginTutorSchedule');
const loginTutorBioInput = document.getElementById('loginTutorBio');
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

const STORAGE_TUTORS = 'tutorProfiles';
const STORAGE_STUDENTS = 'studentProfiles';
const STORAGE_USERS = 'userAccounts';
const CURRENT_USER_KEY = 'currentUser';
let loginMode = 'login';

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadProfiles(key) {
  const raw = localStorage.getItem(key);
  const profiles = raw ? JSON.parse(raw) : [];
  let hasMissingId = false;

  profiles.forEach(profile => {
    if (!profile.id) {
      profile.id = generateId(key === STORAGE_TUTORS ? 'tutor' : 'student');
      hasMissingId = true;
    }
  });

  if (hasMissingId && profiles.length) {
    saveProfiles(key, profiles);
  }

  return profiles;
}

function saveProfiles(key, profiles) {
  localStorage.setItem(key, JSON.stringify(profiles));
}

function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  renderLoginState();
  loadCurrentUserProfile();
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  loginMode = 'login';
  renderLoginState();
  loadCurrentUserProfile();
}

function loadUsers() {
  const raw = localStorage.getItem(STORAGE_USERS);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function findUser(email, role) {
  const users = loadUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.role === role);
}

function registerUser({name, email, password, role}) {
  const users = loadUsers();
  if (findUser(email, role)) {
    return null;
  }
  const user = {
    id: generateId('user'),
    name,
    email,
    password,
    role,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

function authenticateUser({email, password, role}) {
  const user = findUser(email, role);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

function setLoginMode(mode) {
  loginMode = mode;
  if (mode === 'signup') {
    toggleLoginMode.textContent = 'Log in';
    loginSwitchMessage.textContent = 'Already have an account?';
    loginModalTitle.textContent = loginRoleInput.value === 'tutor' ? 'Tutor sign up' : 'Student sign up';
    loginSubmitButton.textContent = 'Sign up';
    loginNameInput.required = true;
    if (loginNameWrapper) {
      loginNameWrapper.classList.remove('hidden');
    }
    loginConfirmPasswordInput.value = '';
    loginConfirmPasswordInput.required = true;
    document.getElementById('confirmPasswordWrapper').classList.remove('hidden');
  } else {
    toggleLoginMode.textContent = 'Sign up';
    loginSwitchMessage.textContent = 'Don\'t have an account?';
    loginModalTitle.textContent = loginRoleInput.value === 'tutor' ? 'Tutor login' : 'Student login';
    loginSubmitButton.textContent = 'Sign in';
    loginNameInput.required = false;
    if (loginNameWrapper) {
      loginNameWrapper.classList.add('hidden');
    }
    loginConfirmPasswordInput.required = false;
    document.getElementById('confirmPasswordWrapper').classList.add('hidden');
  }
  updateSignupFields();
  loginMessage.textContent = '';
}

function updateSignupFields() {
  const isSignup = loginMode === 'signup';
  const role = loginRoleInput.value;
  const tutorVisible = isSignup && role === 'tutor';
  const studentVisible = isSignup && role === 'student';

  tutorSignupFields.classList.toggle('hidden', !tutorVisible);
  studentSignupFields.classList.toggle('hidden', !studentVisible);

  Array.from(tutorSignupFields.querySelectorAll('input, select, textarea')).forEach(field => {
    field.disabled = !tutorVisible;
    if (field.name === 'grade' || field.name === 'school') {
      field.required = tutorVisible;
    }
  });
  Array.from(studentSignupFields.querySelectorAll('input, select, textarea')).forEach(field => {
    field.disabled = !studentVisible;
    if (field.name === 'grade' || field.name === 'school') {
      field.required = studentVisible;
    }
  });
}

function renderLoginState() {
  const user = getCurrentUser();

  if (!user) {
    loginStatus.textContent = '';
    logoutButton.classList.add('hidden');
    profileButton.classList.add('hidden');
    toggleLoginMode.classList.remove('hidden');
    return;
  }

  loginStatus.textContent = `Logged in as ${user.role} • ${user.name}`;
  logoutButton.classList.remove('hidden');
  profileButton.classList.remove('hidden');
  toggleLoginMode.classList.add('hidden');
}

function openLoginModal(role) {
  loginRoleInput.value = role;
  loginForm.reset();
  setLoginMode('login');
  loginModal.classList.remove('hidden');
  loginNameInput.focus();
}

function openProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }
  const profile = getProfileByOwnerId(user.role, user.id);
  profileForm.reset();
  profileMessage.textContent = '';
  profileModalTitle.textContent = user.role === 'tutor' ? 'Edit tutor profile' : 'Edit student profile';
  profileNameInput.value = user.name;
  profileEmailInput.value = user.email;
  showProfileFields(user.role);
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

function closeLogin() {
  loginModal.classList.add('hidden');
  loginForm.reset();
  loginMessage.textContent = '';
}

function getProfileByOwnerId(role, ownerId) {
  const key = role === 'tutor' ? STORAGE_TUTORS : STORAGE_STUDENTS;
  const profiles = loadProfiles(key);
  return profiles.find(profile => profile.ownerId === ownerId) || null;
}

function loadCurrentUserProfile() {
  renderTutorTable();
}

function renderTutorTable() {
  const tutors = loadProfiles(STORAGE_TUTORS);
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

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function createProfileCard(profile, type) {
  const card = document.createElement('article');
  card.className = 'profile-card';
  if (type !== 'tutor') {
    card.classList.add('student-card');
  }

  if (type === 'tutor') {
    const avatar = document.createElement('img');
    avatar.src = profile.photo || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e2e8f0"/%3E%3Ccircle cx="50" cy="35" r="20" fill="%23c7d2fe"/%3E%3Crect x="25" y="60" width="50" height="22" rx="10" fill="%23c7d2fe"/%3E%3C/svg%3E';
    avatar.alt = `${profile.name} profile photo`;
    card.appendChild(avatar);
  }

  const details = document.createElement('div');
  details.className = 'profile-details';

  const title = document.createElement('h3');
  title.textContent = profile.name;
  details.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'profile-meta';
  meta.innerHTML = `
    <span class="meta-pill">${profile.pronouns || 'Pronouns not specified'}</span>
    <span class="meta-pill">Grade ${profile.grade}</span>
    <span class="meta-pill">${profile.school}</span>
  `;

  if (type === 'tutor') {
    meta.innerHTML += `<span class="meta-pill">${profile.wage}</span>`;
  }

  details.appendChild(meta);

  const list = document.createElement('ul');
  list.className = 'topics-list';
  list.innerHTML = profile.topics.map(topic => `<li>${topic}</li>`).join('');
  details.appendChild(list);

  const profileLink = document.createElement('a');
  profileLink.className = 'profile-link';
  profileLink.href = `detail.html?type=${type}&id=${encodeURIComponent(profile.id)}`;
  profileLink.textContent = type === 'tutor' ? 'View tutor profile' : 'View student profile';
  details.appendChild(profileLink);

  card.appendChild(details);
  return card;
}

function renderStudentSummary() {  if (!studentSummary) {
    return;
  }  const students = loadProfiles(STORAGE_STUDENTS);
  studentSummary.innerHTML = '';

  if (!students.length) {
    studentSummary.innerHTML = '<div class="empty-state"><strong>No saved student profile yet.</strong><p>Student data is kept private and only used for tutor recommendations.</p></div>';
    return;
  }

  const latestStudent = students[0];
  const card = document.createElement('article');
  card.className = 'profile-card student-card';

  const details = document.createElement('div');
  details.className = 'profile-details';

  const title = document.createElement('h3');
  title.textContent = latestStudent.name;
  details.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'profile-meta';
  meta.innerHTML = `
    <span class="meta-pill">${latestStudent.pronouns || 'Pronouns not specified'}</span>
    <span class="meta-pill">Grade ${latestStudent.grade}</span>
    <span class="meta-pill">${latestStudent.school}</span>
  `;
  details.appendChild(meta);

  const list = document.createElement('ul');
  list.className = 'topics-list';
  list.innerHTML = latestStudent.topics.map(topic => `<li>${topic}</li>`).join('');
  details.appendChild(list);

  const note = document.createElement('p');
  note.className = 'private-note';
  note.textContent = 'This student profile is private and used only to generate tutor recommendations.';
  details.appendChild(note);

  card.appendChild(details);
  studentSummary.appendChild(card);
}

function renderStudentFeed() {
  if (!studentFeed) {
    return;
  }
  const students = loadProfiles(STORAGE_STUDENTS);
  const tutors = loadProfiles(STORAGE_TUTORS);
  studentFeed.innerHTML = '';

  if (!students.length) {
    studentFeed.innerHTML = '<div class="empty-state"><strong>Add a student profile first.</strong><p>Saved student profiles create a tutor feed that matches shared topics.</p></div>';
    return;
  }

  const latestStudent = students[0];
  const matches = tutors.filter(tutor => tutor.topics.some(topic => latestStudent.topics.includes(topic)));

  if (!matches.length) {
    studentFeed.innerHTML = '<div class="empty-state"><strong>No tutor matches yet.</strong><p>Save tutor profiles with topics that match the student interests to populate this feed.</p></div>';
    return;
  }

  matches.forEach(profile => studentFeed.appendChild(createProfileCard(profile, 'tutor')));
}

function getCheckedTopics(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(input => input.value);
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve('');
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

async function saveSignupProfile(role, user, formData) {
  if (role === 'tutor') {
    const topics = getCheckedTopics(loginForm, 'signupTopics');
    const grade = formData.get('grade');
    const school = formData.get('school').trim();
    if (!grade || !school) {
      return false;
    }
    const photoFile = loginPhotoInput.files[0];
    const photoData = await readImage(photoFile);
    const profiles = loadProfiles(STORAGE_TUTORS);
    const profile = {
      id: generateId('tutor'),
      ownerId: user.id,
      ownerEmail: user.email,
      name: user.name,
      pronouns: formData.get('pronouns').trim(),
      grade,
      school,
      wage: formData.get('wage').trim(),
      schedule: formData.get('schedule').trim(),
      bio: formData.get('bio').trim(),
      topics: topics.length ? topics : ['No topics selected'],
      photo: photoData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    profiles.unshift(profile);
    saveProfiles(STORAGE_TUTORS, profiles);
    return true;
  }

  if (role === 'student') {
    const topics = getCheckedTopics(loginForm, 'signupStudentTopics');
    const grade = formData.get('grade');
    const school = formData.get('school').trim();
    if (!grade || !school) {
      return false;
    }
    const profiles = loadProfiles(STORAGE_STUDENTS);
    const profile = {
      id: generateId('student'),
      ownerId: user.id,
      ownerEmail: user.email,
      name: user.name,
      pronouns: formData.get('pronouns').trim(),
      grade,
      school,
      topics: topics.length ? topics : ['No topics selected'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles.unshift(profile);
    saveProfiles(STORAGE_STUDENTS, profiles);
    return true;
  }

  return false;
}

function handleClearTutors() {
  if (!confirm('Remove all saved tutor profiles from this browser?')) {
    return;
  }
  localStorage.removeItem(STORAGE_TUTORS);
  renderTutorTable();
}

function handleClearStudents() {
  if (!confirm('Remove all saved student profiles from this browser?')) {
    return;
  }
  localStorage.removeItem(STORAGE_STUDENTS);
  renderStudentSummary();
  renderStudentFeed();
}

loginTutorButton.addEventListener('click', () => openLoginModal('tutor'));
loginStudentButton.addEventListener('click', () => openLoginModal('student'));
profileButton.addEventListener('click', openProfileModal);
logoutButton.addEventListener('click', clearCurrentUser);
closeLoginModal.addEventListener('click', closeLogin);
closeProfileModal.addEventListener('click', closeProfile);
loginModal.addEventListener('click', event => {
  if (event.target === loginModal) {
    closeLogin();
  }
});
profileModal.addEventListener('click', event => {
  if (event.target === profileModal) {
    closeProfile();
  }
});
toggleLoginMode.addEventListener('click', () => {
  setLoginMode(loginMode === 'login' ? 'signup' : 'login');
});

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const role = formData.get('role');
  const name = formData.get('name').trim();
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');

  if ((loginMode === 'signup' && !name) || !email || !password) {
    loginMessage.textContent = 'Please complete all required fields.';
    return;
  }

  if (loginMode === 'signup') {
    const confirmPassword = formData.get('confirmPassword');
    if (password !== confirmPassword) {
      loginMessage.textContent = 'Passwords do not match.';
      return;
    }

    const grade = formData.get('grade');
    const school = formData.get('school')?.trim();
    if (!grade || !school) {
      loginMessage.textContent = 'Please complete the profile fields for your selected role.';
      return;
    }

    if (findUser(email, role)) {
      loginMessage.textContent = 'An account with that email already exists for this role.';
      return;
    }

    const user = registerUser({ name, email, password, role });
    if (!user) {
      loginMessage.textContent = 'Unable to create account. Try again.';
      return;
    }

    const profileSaved = await saveSignupProfile(role, user, formData);
    if (!profileSaved) {
      loginMessage.textContent = 'Please complete the profile fields for your selected role.';
      return;
    }

    setCurrentUser(user);
    closeLogin();
    renderTutorTable();
    return;
  }

  const user = authenticateUser({ email, password, role });
  if (!user) {
    loginMessage.textContent = 'Incorrect email or password for this role.';
    return;
  }

  if (role === 'tutor') {
    const profiles = loadProfiles(STORAGE_TUTORS);
    const tutorProfile = profiles.find(p => p.ownerId === user.id);
    if (tutorProfile) {
      tutorProfile.lastLoginAt = new Date().toISOString();
      saveProfiles(STORAGE_TUTORS, profiles);
    }
  }

  setCurrentUser(user);
  closeLogin();
});

profileForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    return;
  }
  const role = user.role;
  const profile = getProfileByOwnerId(role, user.id) || {
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
    saveProfiles(STORAGE_TUTORS, [profile, ...loadProfiles(STORAGE_TUTORS).filter(item => item.ownerId !== user.id)]);
  } else {
    profile.topics = getCheckedTopics(profileForm, 'profileStudentTopics');
    saveProfiles(STORAGE_STUDENTS, [profile, ...loadProfiles(STORAGE_STUDENTS).filter(item => item.ownerId !== user.id)]);
  }

  if (profileNameInput.value.trim() !== user.name) {
    const users = loadUsers();
    const current = users.find(item => item.id === user.id);
    if (current) {
      current.name = profileNameInput.value.trim();
      saveUsers(users);
      setCurrentUser(current);
    }
  }

  profileMessage.textContent = 'Profile saved successfully.';
  renderTutorTable();
  setTimeout(closeProfile, 1200);
});

renderLoginState();
loadCurrentUserProfile();
renderTutorTable();
