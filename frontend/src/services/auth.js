const API_URL = 'http://localhost:8080/auth'; // Replace with your actual backend URL

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to login');
  }

  return response.json();
};

export const signup = async (username, email, password) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }), 
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to sign up');
  }

  // The signup endpoint currently returns the saved user, but doesn't automatically log them in
  // Usually, you'd either return a token from signup or ask them to login.
  // Based on your controller, it returns SignupDTO.
  return response.json();
};
