import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/userStore';
import { getApprovedCommentCounts } from '@/lib/commentStore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/directory
 *
 * Public employer-facing directory. Only returns kids who:
 *   - have status = 'active'
 *   - have hideContactInfo = false  (they've opted in to being contactable)
 *
 * Query params:
 *   q       — text search across name, bio, skills, program
 *   state   — 2-letter US state abbreviation
 *   zip     — exact or prefix match
 *   sort    — 'name' | 'state' | 'zip' | 'comments' | 'funds'  (default: name)
 *   order   — 'asc' | 'desc'  (default: asc)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const stateFilter = (searchParams.get('state') ?? '').trim().toUpperCase();
  const zipFilter = (searchParams.get('zip') ?? '').trim();
  const sort = searchParams.get('sort') ?? 'name';
  const order = searchParams.get('order') === 'desc' ? -1 : 1;

  // Pull all users (kids are embedded documents)
  const users = await getAllUsers();

  // Flatten to a list of searchable kid records
  type DirKid = {
    kidId: string;
    name: string;
    age: number;
    rank: string;
    program?: string;
    bio?: string;
    avatarUrl?: string;
    skills: { name: string; category: string; level: string }[];
    city?: string;
    state?: string;
    zip?: string;
    email?: string;
    phone?: string;
    totalFunds: number;
    commentCount: number;
  };

  const candidates: DirKid[] = [];
  for (const user of users) {
    for (const kid of user.kids) {
      // Gate: must be active and opted in to contact
      if (kid.status !== 'active') continue;
      if (kid.hideContactInfo) continue;

      candidates.push({
        kidId: kid.kidId,
        name: kid.name,
        age: kid.age,
        rank: kid.rank,
        program: kid.program,
        bio: kid.bio,
        avatarUrl: kid.avatarUrl,
        skills: kid.skills.map((s) => ({ name: s.name, category: s.category, level: s.level })),
        city: kid.city ?? user.address?.city,
        state: kid.state ?? user.address?.state,
        zip: kid.zip ?? user.address?.zip,
        email: user.email,
        phone: user.phone,
        totalFunds:
          (kid.communityFunds.education ?? 0) +
          (kid.communityFunds.health ?? 0) +
          (kid.communityFunds.housing ?? 0),
        commentCount: 0, // filled below
      });
    }
  }

  // Enrich with comment counts in a single DB round-trip
  const kidIds = candidates.map((k) => k.kidId);
  const counts = await getApprovedCommentCounts(kidIds);
  for (const c of candidates) c.commentCount = counts[c.kidId] ?? 0;

  // ── Text filter ─────────────────────────────────────────────────────────
  let results = candidates;
  if (q) {
    results = results.filter((k) => {
      const haystack = [
        k.name,
        k.bio ?? '',
        k.program ?? '',
        k.city ?? '',
        k.state ?? '',
        ...k.skills.map((s) => `${s.name} ${s.category}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  // ── Location filters ────────────────────────────────────────────────────
  if (stateFilter) {
    results = results.filter((k) => (k.state ?? '').toUpperCase() === stateFilter);
  }
  if (zipFilter) {
    results = results.filter((k) => (k.zip ?? '').startsWith(zipFilter));
  }

  // ── Sort ────────────────────────────────────────────────────────────────
  results.sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    switch (sort) {
      case 'state':
        av = a.state ?? '';
        bv = b.state ?? '';
        break;
      case 'zip':
        av = a.zip ?? '';
        bv = b.zip ?? '';
        break;
      case 'comments':
        av = a.commentCount;
        bv = b.commentCount;
        break;
      case 'funds':
        av = a.totalFunds;
        bv = b.totalFunds;
        break;
      default: // name
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
    }
    if (av < bv) return -1 * order;
    if (av > bv) return 1 * order;
    return 0;
  });

  return NextResponse.json({ kids: results, total: results.length });
}
