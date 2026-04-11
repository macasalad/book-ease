import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = decodeURIComponent(resolvedParams.id).trim();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const listings = await prisma.bookListing.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    const listingsWithStatus = listings.map((listing) => ({
      ...listing,

      isBorrowed: listing.status === "BORROWED",
    }));

    return NextResponse.json({ items: listingsWithStatus });
    
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user listings" },
      { status: 500 }
    );
  }
}