export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  return response;
}

export async function getMembers() {
  const response = await fetchWithAuth('/api/members');
  return response.json();
}

export async function createMember(data: any) {
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateMember(id: number, data: any) {
  const response = await fetchWithAuth(`/api/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteMember(id: number) {
  const response = await fetchWithAuth(`/api/members/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getPayments() {
  const response = await fetchWithAuth('/api/payments');
  return response.json();
}

export async function getDonations() {
  const response = await fetchWithAuth('/api/donations');
  return response.json();
}

export async function createDonation(data: any) {
  const response = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function initializeDonationPayment(data: any) {
  const response = await fetch('/api/donations/initialize-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function verifyPayment(txRef: string) {
  const response = await fetch(`/api/chapa/verify/${txRef}`);
  return response.json();
}

export async function getPosts() {
  const response = await fetch('/api/posts');
  return response.json();
}

export async function createPost(data: any) {
  const response = await fetchWithAuth('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updatePost(id: number, data: any) {
  const response = await fetchWithAuth(`/api/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deletePost(id: number) {
  const response = await fetchWithAuth(`/api/posts/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getSmsTemplates() {
  const response = await fetchWithAuth('/api/sms-templates');
  return response.json();
}

export async function createSmsTemplate(data: any) {
  const response = await fetchWithAuth('/api/sms-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateSmsTemplate(id: number, data: any) {
  const response = await fetchWithAuth(`/api/sms-templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSmsTemplate(id: number) {
  const response = await fetchWithAuth(`/api/sms-templates/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getSmsLogs() {
  const response = await fetchWithAuth('/api/sms-logs');
  return response.json();
}

export async function getSettings() {
  const response = await fetchWithAuth('/api/settings');
  return response.json();
}

export async function getSettingByKey(key: string) {
  const response = await fetch(`/api/settings/${key}`);
  if (!response.ok) return null;
  return response.json();
}

export async function saveSetting(data: any) {
  const response = await fetchWithAuth('/api/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getRevenueStats() {
  const response = await fetchWithAuth('/api/stats/revenue');
  return response.json();
}
