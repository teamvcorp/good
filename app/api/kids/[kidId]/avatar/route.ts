import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '@/auth';
import { getUserByUsername, updateUser } from '@/lib/userStore';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB hard limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { kidId } = await params;

  // Verify the authenticated user owns this kid
  const user = await getUserByUsername(session.user.username);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const kidIndex = user.kids.findIndex((k) => k.kidId === kidId);
  if (kidIndex === -1) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
      { status: 400 },
    );
  }

  // Validate size
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 4 MB.' },
      { status: 413 },
    );
  }

  // Delete old blob if there is one
  const oldUrl = user.kids[kidIndex].avatarUrl;
  if (oldUrl && oldUrl.includes('blob.vercel-storage.com')) {
    try {
      await del(oldUrl);
    } catch {
      // Non-fatal — continue even if deletion fails
    }
  }

  // Upload to Vercel Blob
  // Pathname format: avatars/{kidId}/{timestamp}.{ext}
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const pathname = `avatars/${kidId}/${Date.now()}.${ext}`;

  const blob = await put(pathname, bytes, {
    access: 'public',
    contentType: file.type,
    // Cache for 1 year — URL changes on each upload so this is safe
    cacheControlMaxAge: 31536000,
  });

  // Persist the new URL to MongoDB
  user.kids[kidIndex].avatarUrl = blob.url;
  user.updatedAt = new Date().toISOString();
  await updateUser(user);

  return NextResponse.json({ url: blob.url });
}
