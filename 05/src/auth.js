const USERS_KEY = 'atelier.accounts.users';
const SESSION_KEY = 'atelier.accounts.session';

function readUsers() {
  let saved;
  try {
    saved = localStorage.getItem(USERS_KEY);
  } catch {
    throw new Error('Browser storage is unavailable. Check your browser settings and try again.');
  }

  if (!saved) return [];

  try {
    const users = JSON.parse(saved);
    if (!Array.isArray(users) || users.some((user) =>
      !user || typeof user.username !== 'string' || typeof user.email !== 'string' ||
      typeof user.salt !== 'string' || typeof user.passwordHash !== 'string'
    )) {
      throw new Error('Invalid user data.');
    }
    return users;
  } catch {
    throw new Error('Saved account data could not be read. Clear this app’s browser data and try again.');
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    throw new Error('Your account could not be saved in browser storage. Check available storage and try again.');
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Secure password storage is unavailable in this browser. Please use a modern browser on localhost or HTTPS.');
  }

  const actualSalt = salt ?? bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
  const data = new TextEncoder().encode(`${actualSalt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return { salt: actualSalt, hash: bytesToHex(new Uint8Array(digest)) };
}

export async function createUser({ username, email, password }) {
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }
  if (users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase())) {
    throw new Error('That username is already taken. Please choose another.');
  }

  const { salt, hash } = await hashPassword(password);
  const user = { username: normalizedUsername, email: normalizedEmail, salt, passwordHash: hash };
  writeUsers([...users, user]);
  return user;
}

export async function findUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = readUsers().find((entry) => entry.email === normalizedEmail);
  if (!user) return null;

  const { hash } = await hashPassword(password, user.salt);
  return hash === user.passwordHash ? user : null;
}

export function saveSession(email) {
  try {
    sessionStorage.setItem(SESSION_KEY, email);
  } catch {
    throw new Error('Your session could not be saved in this browser. Check your browser settings and try again.');
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    throw new Error('Your session could not be cleared in this browser. Please try again.');
  }
}
