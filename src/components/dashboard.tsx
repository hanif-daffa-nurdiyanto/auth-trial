'use client';

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createPost, deletePost, getAllPosts, putPost } from "@/service/post.service";
import { deleteCookie } from 'cookies-next';

type Post = {
  id: string;
  title: string;
  content: string;
  user: {
    id: string;
    name: string | null;
  }
};

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState([{
    idPost: "",
    loading: false
  }]);
  const router = useRouter();

  async function fetchPosts() {
    const posts = await getAllPosts();
    setPosts(posts);
  }

  async function addPost() {
    if (!title || !content) return;
    setLoadingPost(true);
    await createPost(title, content);
    setTitle("");
    setContent("");
    await fetchPosts();
    setLoadingPost(false);
  }

  async function dropPost(id: string) {
    if (!id) return;
    setLoadingDelete([{idPost: id, loading: true}]);
    await deletePost(id);
    await fetchPosts();
    setLoadingDelete([{idPost: "", loading: false}]);
  }

  async function updatePost() {
    if (!editPost) return;
    await putPost(editPost.id, editPost.title, editPost.content);
    setEditPost(null); 
    fetchPosts();
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/signin");
      } else {
        fetchPosts().finally(() => setLoading(false));
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">MyPosts</span>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">{auth.currentUser?.displayName}</span>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
              onClick={async () => {
                await auth.signOut();
                deleteCookie('firebase-token');
                router.replace("/signin");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Add Post</h1>


        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Create Post</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border rounded p-2 w-full mb-2"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="border rounded p-2 w-full mb-2 min-h-[100px]"
          />
            <button
            onClick={addPost}
            className={`bg-blue-500 text-white px-4 py-2 rounded cursor-pointer ${loadingPost ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loadingPost}
            >
              {loadingPost ? "Adding..." : "Add"}
            </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Post List</h1>

        <ul>
          {posts.map((post) => (
            <li
              key={post.id}
              className="border rounded p-4 mb-2 shadow flex flex-col gap-5 justify-between items-end"
            >
              <div className="w-full">
                <h2 className="font-bold">{post.title}</h2>
                <p className="text-gray-500">Posted by {post.user.name}</p>
                <p>{post.content}</p>
              </div>
              {post.user.id === auth.currentUser?.uid && (
                <div className="flex gap-2">
                  <button
                  onClick={() => setEditPost(post)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer"
                  >
                  Edit
                  </button>
                  <button
                  onClick={() => dropPost(post.id)}
                  className={`bg-red-500 text-white px-3 py-1 rounded cursor-pointer ${
                    loadingDelete[0].idPost === post.id && loadingDelete[0].loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                  disabled={loadingDelete[0].idPost === post.id && loadingDelete[0].loading}
                  >
                  {loadingDelete[0].idPost === post.id && loadingDelete[0].loading
                    ? "Deleting..."
                    : "Delete"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {editPost && (
        <div className="fixed inset-0  bg-black/70  flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <input
              value={editPost.title}
              onChange={(e) =>
                setEditPost({ ...editPost, title: e.target.value })
              }
              className="border rounded p-2 w-full mb-2"
            />
            <textarea
              value={editPost.content}
              onChange={(e) =>
                setEditPost({ ...editPost, content: e.target.value })
              }
              className="border rounded p-2 w-full mb-2 min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditPost(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={updatePost}
                className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
