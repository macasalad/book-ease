import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/auth";
import { headers } from "next/headers";


export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

  // check if /public/uploads exists
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Generate unique file name
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, filename);

  // Convert file to buffer and write
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  // Return URL to client
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
}