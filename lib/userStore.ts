import client from './mongodb';
import type { User, Kid } from './types';

const DB = process.env.MONGODB_DATABASE ?? 'gooddeeds';

function usersCol() {
  return client.db(DB).collection<User>('users');
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return usersCol().findOne({ username: username.toLowerCase().trim() });
}

export async function getUserById(id: string): Promise<User | null> {
  return usersCol().findOne({ id });
}

export async function createUser(user: User): Promise<void> {
  await usersCol().insertOne(user);
}

export async function updateUser(user: User): Promise<void> {
  await usersCol().replaceOne({ id: user.id }, user, { upsert: true });
}

/** Find a user that owns a kid with the given kidId */
export async function getUserByKidId(kidId: string): Promise<User | null> {
  return usersCol().findOne({ 'kids.kidId': kidId });
}

export async function getAllUsers(): Promise<User[]> {
  return usersCol().find({}).toArray();
}

/** Generate a unique, human-readable kid identifier like "GD-A3X9K2" */
export function generateKidId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'GD-';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/** Apply tip amount to the kid's community funds */
export async function addTipToKid(
  userId: string,
  kidIndex: number,
  category: Kid['selectedCategory'],
  amountCents: number,
): Promise<void> {
  const col = usersCol();
  await col.updateOne(
    { id: userId },
    { $inc: { [`kids.${kidIndex}.communityFunds.${category}`]: amountCents } },
  );
}
