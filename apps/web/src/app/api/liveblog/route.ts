import { NextResponse } from 'next/server'

// Placeholder — returns empty posts until Payload CMS integration in Wave 4
export async function GET() {
  return NextResponse.json({ posts: [] })
}
