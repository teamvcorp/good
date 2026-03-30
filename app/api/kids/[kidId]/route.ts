import { NextRequest, NextResponse } from 'next/server';
import { getUserByKidId } from '@/lib/userStore';
import { getApprovedComments } from '@/lib/commentStore';

/** GET /api/kids/[kidId] — public resume data */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;
  const user = await getUserByKidId(kidId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const kid = user.kids.find((k) => k.kidId === kidId);
  if (!kid) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const comments = await getApprovedComments(kidId);

  // Respect privacy setting — strip contact info if hideContactInfo is true
  const publicKid = {
    kidId: kid.kidId,
    name: kid.name,
    age: kid.age,
    rank: kid.rank,
    program: kid.program,
    bio: kid.bio,
    avatarUrl: kid.avatarUrl,
    skills: kid.skills,
    grades: kid.grades,
    accomplishments: kid.accomplishments,
    employment: kid.employment ?? [],
    education: kid.education ?? [],
    communityFunds: kid.communityFunds,
    selectedCategory: kid.selectedCategory,
    accentColor: kid.accentColor ?? 'emerald',
    hideContactInfo: kid.hideContactInfo,
    // Only include contact if not hidden
    ...(kid.hideContactInfo
      ? {}
      : { email: kid.email, phone: kid.phone, socialLinks: kid.socialLinks }),
  };

  return NextResponse.json({ kid: publicKid, comments });
}
