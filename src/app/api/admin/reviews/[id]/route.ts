import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
export const dynamic = "force-dynamic";
  const { action } = await req.json();
  if (action !== "approve" && action !== "reject")
    return NextResponse.json({ error: "无效的操作" }, { status: 400 });

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review || review.status !== "PENDING")
    return NextResponse.json({ error: "评价不存在或已被处理" }, { status: 404 });

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: { status: action === "approve" ? "APPROVED" : "REJECTED" },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
