import axiosClient from "./axiosClientApi";

// ===============================
// LOGIN USER
// ===============================
export const loginUser = async (username, password) => {
  const response = await axiosClient.post("/auth/login", {
    username,
    password,
  });

  return response.data;
};

// ===============================
// REGISTER USER
// ===============================
export const registerUser = async (userData) => {
  const response = await axiosClient.post("/auth/register", userData);

  return response.data;
};

// ===============================
// LOGOUT USER
// ===============================
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ===============================
// GET CURRENT USER
// ===============================
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    return null;
  }
};

// ===============================
// CHECK LOGIN
// ===============================
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};

export const getAdminProfile = async () => {
  const response = await axiosClient.get("/admin/profile");
  return response.data;
};

export const updateAdminProfile = async (profile) => {
  const response = await axiosClient.put("/admin/profile", profile);
  return response.data;
};
