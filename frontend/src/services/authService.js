import apiClient from "../api/apiClient";

// =========================================================
// LOGIN
// =========================================================

export const login = async (
  loginData
) => {

  const response =
    await apiClient.post(
      "/auth/login",
      loginData
    );

  return response.data;
};

// Keep compatibility with existing imports
export const loginUser = login;

// =========================================================
// REGISTER
// =========================================================

export const register = async (
  registerData
) => {

  const response =
    await apiClient.post(
      "/auth/register",
      registerData
    );

  return response.data;
};

// =========================================================
// LOGOUT
// =========================================================

export const logout = () => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "role"
  );

  localStorage.removeItem(
    "username"
  );

  localStorage.removeItem(
    "user"
  );
};

// =========================================================
// TOKEN
// =========================================================

export const getToken = () => {
  return localStorage.getItem(
    "token"
  );
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(
    "token"
  );
};
