import API from "../config/api";

/**
 * Update user name
 * PUT /api/user/profile
 */
export const updateProfile = (name) => {
  return API.put("/user/profile", { name });
};

/**
 * Change user password
 * PUT /api/user/password
 */
export const changePassword = (data) => {
  return API.put("/user/password", data);
};

/**
 * Disconnect Google account
 * DELETE /api/user/google
 */
export const disconnectGoogle = () => {
  return API.delete("/user/google");
};

/**
 * Fetch profile summary
 * GET /api/user/profile/summary
 */
export const fetchProfileSummary = () => {
  return API.get("/user/profile/summary");
};
