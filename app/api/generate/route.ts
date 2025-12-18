import { NextResponse } from 'next/server';
import { generateReviewReply } from '@/lib/ai-response';

export async function POST(request: Request) {
  const body = await request.json();
  const reply = await generateReviewReply(body); // On appelle votre fonction "Ultimate"
  return NextResponse.json({ reply });
}