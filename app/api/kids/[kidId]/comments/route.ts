import { NextRequest, NextResponse } from 'next/server';
import { getUserByKidId, updateUser } from '@/lib/userStore';
import { createComment, getAllComments, updateCommentStatus } from '@/lib/commentStore';
import { auth } from '@/auth';
import type { CommunityComment } from '@/lib/types';

/** POST /api/kids/[kidId]/comments — submit a community comment (pending moderation) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;
  const user = await getUserByKidId(kidId);
  if (!user) return NextResponse.json({ error: 'Kid not found' }, { status: 404 });

  const body = await request.json();
  const authorName = String(body.authorName ?? '').trim().slice(0, 80);
  const bodyText = String(body.body ?? '').trim().slice(0, 1000);

  if (!authorName || !bodyText) {
    return NextResponse.json({ error: 'Name and comment body are required.' }, { status: 400 });
  }

  const comment: CommunityComment = {
    id: crypto.randomUUID(),
    kidId,
    authorName,
    body: bodyText,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await createComment(comment);
  return NextResponse.json({ success: true, message: 'Comment submitted for review.' });
}

/** GET /api/kids/[kidId]/comments — owner sees all (pending/approved/rejected) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the logged-in parent owns this kid
  const owner = await getUserByKidId(kidId);
  if (!owner || owner.username !== session.user.username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const comments = await getAllComments(kidId);
  return NextResponse.json({ comments });
}

/** PATCH /api/kids/[kidId]/comments — approve or reject a comment */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owner = await getUserByKidId(kidId);
  if (!owner || owner.username !== session.user.username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { commentId, action } = await request.json();
  if (!commentId || !['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'commentId and action (approved|rejected) required.' }, { status: 400 });
  }

  await updateCommentStatus(commentId, action);
  return NextResponse.json({ success: true });
}
