const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error?.message || 'Authentication failed');
  }

  return data;
}

export function loginUser({ email, password }) {
  return request('/users/login', { email, password });
}

export function signupUser({ name, email, password, passwordConfirm, department }) {
  return request('/users/signup', {
    name,
    email,
    password,
    passwordConfirm,
    department,
  });
}

