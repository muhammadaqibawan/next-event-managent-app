
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({ message: "Session active" });
}
