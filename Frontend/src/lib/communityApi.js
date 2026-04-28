import { teacherAPI, studentAPI } from "@/lib/api";

/* =========================
   GET COMMUNITY POSTS
   role = "teacher" | "student"
========================= */
export const getCommunityPosts = (
  communityId,
  role,
  page = 1,
  limit = 10
) => {
  const api = role === "teacher" ? teacherAPI : studentAPI;

  return api.get(
    `/communities/${communityId}/posts`,
    {
      params: { page, limit },
    }
  );
};

/* =========================
   CREATE COMMUNITY POST
   (Teacher only)
========================= */
export const createCommunityPost = (
  communityId,
  formData
) => {
  const text =
    typeof formData?.get === "function"
      ? formData.get("content")
      : formData?.text || "";

  return teacherAPI.post(
    `/communities/${communityId}/posts`,
    { text }
  );
};
/* =========================
   ✏️ UPDATE COMMUNITY POST
   (Teacher only)
========================= */
export const updateCommunityPost = (
  communityId,
  postId,
  text
) => {
  return teacherAPI.put(
    `/communities/${communityId}/posts/${postId}`,
    { text }
  );
};

/* =========================
   🗑 DELETE COMMUNITY POST
   (Teacher only)
========================= */
export const deleteCommunityPost = (
  communityId,
  postId
) => {
  return teacherAPI.delete(
    `/communities/${communityId}/posts/${postId}`
  );
};
