const API_BASE_URL = 'http://127.0.0.1:8081/api/v1';

export async function apiFetch(endpoint: String, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: `Server error ${response.status}: ${responseText.substring(0, 100)}` };
      }
      
      if (response.status === 401) {
        throw new Error(errorData.message || 'Unauthorized access');
      }
      
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    try {
      return responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
    }
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
}
