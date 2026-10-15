import axiosClient from "./axiosClientApi";

export const getNotifications = async () => {
  const response = await axiosClient.get("/notifications");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await axiosClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const getChatMessages = async () => {
  const response = await axiosClient.get("/chat/messages");
  return response.data;
};

export const sendChatMessage = async (content) => {
  const response = await axiosClient.post("/chat/messages", { content });
  return response.data;
};

export const deleteChatMessage = async (id) => {
  await axiosClient.delete(`/chat/messages/${id}`);
};
