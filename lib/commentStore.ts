import client from './mongodb';
import type { CommunityComment } from './types';

const DB = process.env.MONGODB_DATABASE ?? 'gooddeeds';

function col() {
  return client.db(DB).collection<CommunityComment>('comments');
}

export async function createComment(comment: CommunityComment): Promise<void> {
  await col().insertOne(comment);
}

/** Returns approved comments for a public resume */
export async function getApprovedComments(kidId: string): Promise<CommunityComment[]> {
  return col()
    .find({ kidId, status: 'approved' })
    .sort({ createdAt: -1 })
    .toArray();
}

/** Returns all comments (pending + approved + rejected) for moderation */
export async function getAllComments(kidId: string): Promise<CommunityComment[]> {
  return col().find({ kidId }).sort({ createdAt: -1 }).toArray();
}

export async function updateCommentStatus(
  commentId: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  await col().updateOne(
    { id: commentId },
    {
      $set: {
        status,
        ...(status === 'approved' ? { approvedAt: new Date().toISOString() } : {}),
      },
    },
  );
}

/** Returns a map of kidId → approved comment count for the given kid IDs */
export async function getApprovedCommentCounts(kidIds: string[]): Promise<Record<string, number>> {
  if (kidIds.length === 0) return {};
  const agg = await col()
    .aggregate<{ _id: string; count: number }>([
      { $match: { kidId: { $in: kidIds }, status: 'approved' } },
      { $group: { _id: '$kidId', count: { $sum: 1 } } },
    ])
    .toArray();
  const result: Record<string, number> = {};
  for (const row of agg) result[row._id] = row.count;
  return result;
}
