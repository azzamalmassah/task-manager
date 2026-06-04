const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error?.message || 'Task request failed');
  }

  return data;
}

export async function getTasks(token, { page = 1, limit } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (limit) params.set('limit', String(limit));

  const result = await request(`/tasks?${params.toString()}`, { token });
  return result.data?.data || [];
}

export async function createTask(token, task) {
  const result = await request('/tasks', {
    method: 'POST',
    token,
    body: task,
  });
  return result.data?.data;
}

export async function updateTask(token, taskId, updates) {
  const result = await request(`/tasks/${taskId}`, {
    method: 'PATCH',
    token,
    body: updates,
  });
  return result.data?.data;
}

export async function deleteTask(token, taskId) {
  await request(`/tasks/${taskId}`, {
    method: 'DELETE',
    token,
  });
}
