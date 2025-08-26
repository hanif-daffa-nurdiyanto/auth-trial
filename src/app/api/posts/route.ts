import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await adminFirestore
      .collection("posts")
      .orderBy("createdAt", "desc")
      .get();

    const posts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = data.userId ?? null;

        let user: { id: string; name: string | null } | null = null;

        if (userId) {
          try {
            const firebaseUser = await adminAuth.getUser(userId);
            user = {
              id: userId,
              name: firebaseUser.displayName ?? null,
            };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err: unknown) {
            user = {
              id: userId,
              name: null,
            };
          }
        }

        return {
          id: doc.id,
          ...data,
          user,
        };
      })
    );

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Firestore GET error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const newPost = {
      title,
      content,
      userId: decoded.uid,
      createdAt: Date.now(),
    };

    const docRef = await adminFirestore.collection("posts").add(newPost);

    return NextResponse.json(
      { id: docRef.id, ...newPost },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}