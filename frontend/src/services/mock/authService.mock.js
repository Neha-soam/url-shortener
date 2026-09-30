import { mockUser } from './mockData.js';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function login(email, password) {
  await delay();
  if (!password || password.length < 8) throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  return { token: 'mock-token-abc123', user: { ...mockUser, email } };
}

export async function register(email, password) {
  await delay();
  if (!password || password.length < 8) throw Object.assign(new Error('Password must be at least 8 characters'), { status: 400 });
  return { token: 'mock-token-abc123', user: { ...mockUser, email } };
}
