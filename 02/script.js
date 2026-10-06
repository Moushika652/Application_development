// ============================================================
// Tab switching between Log in / Sign up
// ============================================================
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const indicator = document.querySelector('.tab-indicator');

function activateTab(which){
  const loginActive = which === 'login';
  tabLogin.classList.toggle('active', loginActive);
  tabSignup.classList.toggle('active', !loginActive);
  tabLogin.setAttribute('aria-selected', loginActive);
  tabSignup.setAttribute('aria-selected', !loginActive);
  loginForm.classList.toggle('hidden', !loginActive);
  signupForm.classList.toggle('hidden', loginActive);
  indicator.style.transform = loginActive ? 'translateX(0%)' : 'translateX(100%)';
}

tabLogin.addEventListener('click', () => activateTab('login'));
tabSignup.addEventListener('click', () => activateTab('signup'));

// ============================================================
// Show / hide password
// ============================================================
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? 'Hide' : 'Show';
  });
});

// ============================================================
// Validation helpers
// ============================================================
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // 10-digit mobile number

function setError(inputId, errorId, message){
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  input.classList.toggle('invalid', Boolean(message));
  errorEl.textContent = message || '';
  return !message;
}

function showStatus(el, message, type){
  el.textContent = message;
  el.className = 'form-status show ' + type;
}

// ============================================================
// LOGIN validation
// ============================================================
const loginStatus = document.getElementById('login-status');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let valid = true;

  if (!email){
    valid = setError('login-email', 'login-email-error', 'Email is required.') && valid;
  } else if (!EMAIL_RE.test(email)){
    valid = setError('login-email', 'login-email-error', 'Enter a valid email address.') && valid;
  } else {
    setError('login-email', 'login-email-error', '');
  }

  if (!password){
    valid = setError('login-password', 'login-password-error', 'Password is required.') && valid;
  } else {
    setError('login-password', 'login-password-error', '');
  }

  if (valid){
    showStatus(loginStatus, 'Logged in successfully. Redirecting…', 'success');
    loginForm.reset();
  } else {
    showStatus(loginStatus, 'Please fix the errors below and try again.', 'fail');
  }
});

// ============================================================
// SIGNUP validation
// ============================================================
const signupStatus = document.getElementById('signup-status');
const signupPassword = document.getElementById('signup-password');
const strengthBars = document.querySelectorAll('.strength-meter span');

function passwordStrength(pwd){
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
}

signupPassword.addEventListener('input', () => {
  const score = passwordStrength(signupPassword.value);
  const colors = ['#E4E2DC', '#E24C4B', '#E2A24C', '#E2A24C', '#2FBF9F'];
  strengthBars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score] : '#E4E2DC';
  });
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const agreed = document.getElementById('agree-terms').checked;

  let valid = true;

  // Name
  if (!name){
    valid = setError('signup-name', 'signup-name-error', 'Full name is required.') && valid;
  } else {
    setError('signup-name', 'signup-name-error', '');
  }

  // Email
  if (!email){
    valid = setError('signup-email', 'signup-email-error', 'Email is required.') && valid;
  } else if (!EMAIL_RE.test(email)){
    valid = setError('signup-email', 'signup-email-error', 'Enter a valid email address.') && valid;
  } else {
    setError('signup-email', 'signup-email-error', '');
  }

  // Phone
  if (!phone){
    valid = setError('signup-phone', 'signup-phone-error', 'Phone number is required.') && valid;
  } else if (!PHONE_RE.test(phone)){
    valid = setError('signup-phone', 'signup-phone-error', 'Enter a valid 10-digit mobile number.') && valid;
  } else {
    setError('signup-phone', 'signup-phone-error', '');
  }

  // Password
  if (!password){
    valid = setError('signup-password', 'signup-password-error', 'Password is required.') && valid;
  } else if (password.length < 8){
    valid = setError('signup-password', 'signup-password-error', 'Password must be at least 8 characters.') && valid;
  } else {
    setError('signup-password', 'signup-password-error', '');
  }

  // Confirm password
  if (!confirm){
    valid = setError('signup-confirm', 'signup-confirm-error', 'Please confirm your password.') && valid;
  } else if (confirm !== password){
    valid = setError('signup-confirm', 'signup-confirm-error', 'Passwords do not match.') && valid;
  } else {
    setError('signup-confirm', 'signup-confirm-error', '');
  }

  // Terms
  const termsError = document.getElementById('terms-error');
  if (!agreed){
    termsError.textContent = 'You must agree to the terms to continue.';
    valid = false;
  } else {
    termsError.textContent = '';
  }

  if (valid){
    showStatus(signupStatus, 'Account created successfully. You can now log in.', 'success');
    signupForm.reset();
    strengthBars.forEach(bar => bar.style.background = '#E4E2DC');
  } else {
    showStatus(signupStatus, 'Please fix the errors below and try again.', 'fail');
  }
});
