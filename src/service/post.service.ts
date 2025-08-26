import { auth } from "@/lib/firebase";

export type Post = {
  id: string;
  title: string;
  content: string;
  user: {
    id: string;
    name: string | null;
  };
};

async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function getAllPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function createPost(title: string, content: string) {
  const token = await getToken();
  if (!token) throw new Error("User is not authenticated");

  const res = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    throw new Error("Failed to create post");
  }

  return res.json();
}

export async function putPost(id: string, title: string, content: string) {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

export async function deletePost(id: string) {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`api/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete post");
  return res.json();
}
