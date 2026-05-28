const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loginRoleInput = document.getElementById('loginRole');
const tutorSignupFields = document.getElementById('tutorSignupFields');
const studentSignupFields = document.getElementById('studentSignupFields');
const loginPhotoInput = document.getElementById('loginPhoto');

// Extract role from URL if present
const urlParams = new URLSearchParams(window.location.search);
const initialRole = urlParams.get('role');
if (initialRole && (initialRole === 'tutor' || initialRole === 'student')) {
  loginRoleInput.value = initialRole;
}

function updateSignupFields() {
  const role = loginRoleInput.value;
  const tutorVisible = role === 'tutor';
  const studentVisible = role === 'student';

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

loginRoleInput.addEventListener('change', updateSignupFields);
updateSignupFields();

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
    await upsertProfile(STORAGE_TUTORS, profile);
    return true;
  }

  if (role === 'student') {
    const topics = getCheckedTopics(loginForm, 'signupStudentTopics');
    const grade = formData.get('grade');
    const school = formData.get('school').trim();
    if (!grade || !school) {
      return false;
    }
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
    await upsertProfile(STORAGE_STUDENTS, profile);
    return true;
  }

  return false;
}

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const role = formData.get('role');
  const name = formData.get('name').trim();
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!name || !email || !password || !confirmPassword) {
    loginMessage.textContent = 'Please complete all required fields.';
    return;
  }

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

  const user = await registerUser({ name, email, password, role });
  if (!user || user.error) {
    loginMessage.textContent = (user && user.error) || 'Unable to create account. Try again.';
    return;
  }

  const profileSaved = await saveSignupProfile(role, user, formData);
  if (!profileSaved) {
    loginMessage.textContent = 'Please complete the profile fields for your selected role.';
    return;
  }

  setCurrentUser(user);
  window.location.href = 'index.html';
});
