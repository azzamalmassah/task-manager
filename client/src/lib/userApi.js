const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function getUsers(token, { page = 1, limit } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (limit) params.set('limit', String(limit));

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || result.error?.message || 'Could not load users from the database.');
  }

  return result.data?.data || [];
}

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || result.error?.message || 'User request failed.');
  }

  return result;
}

export async function getUser(token, userId) {
  const result = await request(`/users/${userId}`, { token });
  return result.data?.data;
}

export async function createUser(token, user) {
  const result = await request('/users', {
    method: 'POST',
    token,
    body: user,
  });
  return result.data?.data;
}

export async function updateUser(token, userId, updates) {
  const result = await request(`/users/${userId}`, {
    method: 'PATCH',
    token,
    body: updates,
  });
  return result.data?.data;
}

export async function deleteUser(token, userId) {
  await request(`/users/${userId}`, {
    method: 'DELETE',
    token,
  });
}
