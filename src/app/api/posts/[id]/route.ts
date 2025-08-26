import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";



export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const { id } = await params;

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const currentUid = decoded.uid;

    const docRef = adminFirestore.collection("posts").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snapshot.data();
    if (!data || data.userId !== currentUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.title) updates.title = body.title;
    if (body.content) updates.content = body.content;

    if (Object.keys(updates).length > 0) {
      await docRef.update(updates);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const { id } = await params;

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const currentUid = decoded.uid;

    const docRef = adminFirestore.collection("posts").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snapshot.data();
    if (!data || data.userId !== currentUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}