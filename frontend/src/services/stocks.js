const API_URL = 'http://localhost:8080/api/v1/stocks';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const searchStocks = async (keyword, options = {}) => {
  if (!keyword) return [];
  
  const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(keyword)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to search stocks');
  }

  return response.json();
};

export const getExploreData = async (options = {}) => {
  const response = await fetch(`${API_URL}/explore`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: options.signal,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load explore data');
  }
  return response.json();
};

export const getStockDetails = async (symbol, options = {}) => {
  const response = await fetch(`${API_URL}/${encodeURIComponent(symbol)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: options.signal,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load stock details');
  }
  return response.json();
};

export const getStockHistory = async (symbol, options = {}) => {
  const response = await fetch(`${API_URL}/${encodeURIComponent(symbol)}/history`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: options.signal,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load stock history');
  }
  return response.json();
};
