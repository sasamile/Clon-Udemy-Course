import { Category, Course } from "@prisma/client";
import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryID?: string;
};

export const getCourses = async ({
  userId,
  title,
  categoryID,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
        },
        categoryID,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
          },
        },
        Purchases: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const courseWitProgress: CourseWithProgressWithCategory[] =
      await Promise.all(
        courses.map(async (course) => {
          if (course.Purchases.length === 0) {
            return {
              ...course,
              progress: null,
            };
          }

          const progressPercentaje = await getProgress(userId, course.id);
          return {
            ...course,
            progress: progressPercentaje,
          };
        })
      );

    return courseWitProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};
