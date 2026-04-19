import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestId: string | undefined;
    
    if (params && params.requestId) {
      requestId = params.requestId;
    } 
    else {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const requestIdIndex = pathParts.indexOf('borrow') + 1;
      if (requestIdIndex < pathParts.length) {
        requestId = pathParts[requestIdIndex];
      }
    }
    
    console.log("Extracted requestId:", requestId);
    console.log("Params object:", params);
    console.log("Full URL:", request.url);

    if (!requestId) {
      return NextResponse.json({ 
        error: "Request ID is required",
        debug: { params, url: request.url }
      }, { status: 400 });
    }

    const { action } = await request.json();
    
    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const borrowRequest = await prisma.borrowRequest.findUnique({ 
      where: { id: requestId } 
    });
    
    if (!borrowRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    
    if (borrowRequest.lenderId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (action === "APPROVED") {
      const book = await prisma.bookListing.findUnique({
        where: { id: borrowRequest.bookId },
        select: { 
          status: true,
          borrowRecords: {
            where: { returnedAt: null },
            select: { id: true, borrowerId: true }
          }
        }
      });
      
      const activeRecord = book?.borrowRecords.find(
        record => record.borrowerId === borrowRequest.borrowerId
      );

      if (book?.status !== "AVAILABLE" && !activeRecord) {
        return NextResponse.json({ 
          error: "Book is no longer available" 
        }, { status: 400 });
      }

      const newDueDate = borrowRequest.returnDate ? new Date(borrowRequest.returnDate) : null;
      
      await prisma.$transaction(async (tx) => {
        await tx.borrowRequest.update({ 
          where: { id: requestId }, 
          data: { status: "APPROVED" } 
        });

        await tx.bookListing.update({ 
          where: { id: borrowRequest.bookId }, 
          data: { status: "BORROWED" } 
        });

        if (activeRecord) {
          await tx.borrowRecord.update({
            where: { id: activeRecord.id },
            data: { dueAt: newDueDate },
          });
        } else {
          await tx.borrowRecord.create({
            data: {
              borrowerId: borrowRequest.borrowerId,
              bookId: borrowRequest.bookId,
              dueAt: newDueDate,
            },
          });
        }
      });
    } else {
      await prisma.borrowRequest.update({ 
        where: { id: requestId }, 
        data: { status: "REJECTED" } 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}