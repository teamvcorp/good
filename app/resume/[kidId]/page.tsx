import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicResume from './PublicResume';
import type { Kid, CommunityComment } from '@/lib/types';

interface ResumeData {
  kid: Kid;
  comments: CommunityComment[];
}

async function getData(kidId: string): Promise<ResumeData | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const res = await fetch(`${base}/api/kids/${kidId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata(
  { params }: { params: Promise<{ kidId: string }> },
): Promise<Metadata> {
  const { kidId } = await params;
  const data = await getData(kidId);
  if (!data) return { title: 'Resume Not Found — Good Deeds' };
  return {
    title: `${data.kid.name}'s Resume — Good Deeds`,
    description: data.kid.bio ?? `${data.kid.name} is a Good Deeds student making a difference in the community.`,
  };
}

export default async function ResumePage(
  { params }: { params: Promise<{ kidId: string }> },
) {
  const { kidId } = await params;
  const data = await getData(kidId);
  if (!data) notFound();
  return <PublicResume kid={data.kid} comments={data.comments} />;
}
