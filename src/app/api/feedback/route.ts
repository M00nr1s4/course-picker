import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "反馈内容不能为空" }, { status: 400 });
  if (content.length > 1000) return NextResponse.json({ error: "反馈内容不能超过1000字" }, { status: 400 });

  await prisma.feedback.create({
    data: { userId: (session.user as any).id, content },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
