import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId, chapterId } = params;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    
    const unpublishedChapter = await db.chapter.update({
        where: {
            id: chapterId,
            courseId,
        },
        data: {
            isPublished: false,
        },
    });
    
    const publishedChaptersInCourse = await db.chapter.findMany({
        where:{
            courseId,
            isPublished:true
        }
    })
    
    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where:{
            id:courseId
        },
        data:{
            isPublished:false
        }
      })
    }



    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
