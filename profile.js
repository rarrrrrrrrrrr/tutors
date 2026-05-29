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

async function initProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  profileModalTitle.textContent = user.role === 'tutor' ? 'Edit tutor profile' : 'Edit student profile';
  profileNameInput.value = user.name;
  profileEmailInput.value = user.email;

  showProfileFields(user.role);
  const profile = await getProfileByOwnerId(user.role, user.id);
  populateProfileForm(user.role, profile);
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

  try {
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
          sessionStorage.setItem('currentUser', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Failed to update user name:', err);
      }
    }

    profileMessage.textContent = 'Profile saved successfully.';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  } catch (err) {
    console.error('Profile save error:', err);
    profileMessage.textContent = 'Failed to save profile. The image might be too large or there was a network error.';
  }
});

initProfilePage();
