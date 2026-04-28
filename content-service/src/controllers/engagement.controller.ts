import { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../models/course.model";
import { Enrollment } from "../models/dashboard.model";
import { ExternalUser } from "../models/external-user.model";
import { Note } from "../models/note.model";
import { Question } from "../models/question.model";
import { Review } from "../models/review.model";
import { Wishlist } from "../models/wishlist.model";
import { Community } from "../models/community.model";
import { Announcement } from "../models/announcement.model";

const asId = (value: any) => String(value);

const getTeacherCourseIds = async (teacherId: string) => {
  const courses = await Course.find({ teacherId }).select("_id").lean();
  return courses.map((course: any) => String(course._id));
};

const getUserMap = async (userIds: string[]) => {
  if (!userIds.length) return new Map<string, any>();
  const users = await ExternalUser.find({ _id: { $in: userIds } }).lean();
  return new Map(users.map((user: any) => [String(user._id), user]));
};

export const getMyCourses = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  if (!studentId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const enrollments = await Enrollment.find({ studentId }).sort({ updatedAt: -1 }).lean();
  const courseIds = enrollments.map((item: any) => item.courseId);
  const courses = courseIds.length ? await Course.find({ _id: { $in: courseIds } }).lean() : [];
  const courseMap = new Map(courses.map((course: any) => [String(course._id), course]));
  const teacherMap = await getUserMap(
    Array.from(new Set(courses.map((course: any) => String(course.teacherId)).filter(Boolean)))
  );

  const enrolledCourses = enrollments
    .map((enrollment: any) => {
      const course = courseMap.get(String(enrollment.courseId));
      if (!course) return null;
      const teacher = teacherMap.get(String(course.teacherId));

      return {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail || "",
        progress: Number(enrollment.progress || 0),
        completed: Boolean(enrollment.completed),
        instructor: teacher ? { name: teacher.name } : { name: "Instructor" },
      };
    })
    .filter(Boolean);

  return res.json({ courses: enrolledCourses });
};

export const upsertCourseReview = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const { rating, comment } = req.body;

  if (!studentId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const enrollment = await Enrollment.findOne({
    studentId,
    courseId: req.params.courseId,
  }).lean();

  if (!enrollment) {
    return res.status(403).json({ message: "Enroll before reviewing this course" });
  }

  await Review.findOneAndUpdate(
    { studentId, courseId: req.params.courseId },
    {
      studentId,
      courseId: req.params.courseId,
      rating: Number(rating || 0),
      comment: String(comment || ""),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const reviews = await Review.find({ courseId: req.params.courseId }).lean();
  const ratingAvg = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) /
      reviews.length
    : 0;

  await Course.findByIdAndUpdate(req.params.courseId, {
    ratingAvg: Number(ratingAvg.toFixed(1)),
    ratingCount: reviews.length,
  });

  return res.json({ success: true });
};

export const listNotes = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const notes = await Note.find({ studentId, courseId: req.params.courseId })
    .sort({ updatedAt: -1 })
    .lean();
  return res.json(notes);
};

export const createNote = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const note = await Note.create({
    studentId,
    courseId: req.params.courseId,
    content: String(req.body.content || ""),
  });
  return res.status(201).json({ note });
};

export const updateNote = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.noteId, studentId, courseId: req.params.courseId },
    { content: String(req.body.content || "") },
    { new: true }
  ).lean();

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  return res.json({ note });
};

export const deleteNote = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  await Note.findOneAndDelete({
    _id: req.params.noteId,
    studentId,
    courseId: req.params.courseId,
  });
  return res.json({ success: true });
};

export const listCourseQuestions = async (req: Request, res: Response) => {
  const questions = await Question.find({ courseId: req.params.courseId })
    .sort({ createdAt: -1 })
    .lean();
  const userMap = await getUserMap(
    Array.from(new Set(questions.map((question: any) => question.studentId).filter(Boolean)))
  );

  return res.json({
    questions: questions.map((question: any) => ({
      ...question,
      student: userMap.get(String(question.studentId))
        ? {
            name: userMap.get(String(question.studentId)).name,
            email: userMap.get(String(question.studentId)).email,
          }
        : { name: "Student" },
    })),
  });
};

export const askQuestion = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const question = await Question.create({
    studentId,
    courseId: req.params.courseId,
    lessonId: req.body.lessonId || null,
    question: String(req.body.question || ""),
  });

  return res.status(201).json({ question });
};

export const listTeacherQuestions = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const courseIds = await getTeacherCourseIds(teacherId);
  const questions = courseIds.length
    ? await Question.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 }).lean()
    : [];
  const userMap = await getUserMap(
    Array.from(new Set(questions.map((question: any) => question.studentId).filter(Boolean)))
  );

  return res.json(
    questions.map((question: any) => ({
      ...question,
      student: userMap.get(String(question.studentId))
        ? {
            name: userMap.get(String(question.studentId)).name,
            email: userMap.get(String(question.studentId)).email,
          }
        : { name: "Student" },
    }))
  );
};

export const replyToQuestion = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const courseIds = await getTeacherCourseIds(teacherId);

  const question = await Question.findOneAndUpdate(
    { _id: req.params.qnaId, courseId: { $in: courseIds } },
    { reply: String(req.body.reply || ""), repliedBy: teacherId },
    { new: true }
  ).lean();

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  return res.json({ question });
};

export const listWishlist = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const items = await Wishlist.find({ studentId }).sort({ createdAt: -1 }).lean();
  const courseIds = items.map((item: any) => item.courseId);
  const courses = courseIds.length ? await Course.find({ _id: { $in: courseIds } }).lean() : [];
  const courseMap = new Map(courses.map((course: any) => [String(course._id), course]));
  const teacherMap = await getUserMap(
    Array.from(new Set(courses.map((course: any) => String(course.teacherId)).filter(Boolean)))
  );

  return res.json({
    wishlist: items
      .map((item: any) => {
        const course = courseMap.get(String(item.courseId));
        if (!course) return null;
        const teacher = teacherMap.get(String(course.teacherId));
        return {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail || "",
          price: Number(course.price || 0),
          instructor: teacher ? { name: teacher.name } : null,
        };
      })
      .filter(Boolean),
  });
};

export const addWishlistItem = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const courseId = String(req.body.courseId || req.params.courseId || "");

  if (!studentId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const course = await Course.findOne({
    status: "published",
    $or: [
      ...(mongoose.Types.ObjectId.isValid(courseId) ? [{ _id: courseId }] : []),
      { slug: courseId },
    ],
  }).lean();
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  await Wishlist.findOneAndUpdate(
    { studentId, courseId: String(course._id) },
    { studentId, courseId: String(course._id) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({ success: true });
};

export const removeWishlistItem = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  await Wishlist.findOneAndDelete({ studentId, courseId: req.params.courseId });
  return res.json({ success: true });
};

export const listCommunities = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string;
  const userId = req.headers["x-user-id"] as string;

  const communities =
    role === "teacher"
      ? await Community.find({ teacherId: userId }).sort({ createdAt: -1 }).lean()
      : await Community.find({ status: "approved" }).sort({ createdAt: -1 }).lean();

  return res.json(
    communities.map((community: any) => ({
      ...community,
      isApproved: community.status === "approved",
    }))
  );
};

export const createCommunity = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const community = await Community.create({
    teacherId,
    title: String(req.body.title || ""),
    description: String(req.body.description || ""),
    status: "pending",
    members: [],
    joinRequests: [],
    posts: [],
  });

  return res.status(201).json({ community });
};

export const joinCommunity = async (req: Request, res: Response) => {
  const studentId = req.headers["x-user-id"] as string;
  const community = await Community.findById(req.params.communityId);

  if (!community || community.status !== "approved") {
    return res.status(404).json({ message: "Community not available" });
  }

  if (!community.members.map(asId).includes(studentId) && !community.joinRequests.map(asId).includes(studentId)) {
    community.joinRequests.push(studentId as any);
    await community.save();
  }

  return res.json({ success: true });
};

export const listCommunityRequests = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const community = (await Community.findOne({
    _id: req.params.communityId,
    teacherId,
  }).lean()) as any;

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const userMap = await getUserMap((community.joinRequests || []).map((id: any) => String(id)));
  return res.json({
    joinRequests: (community.joinRequests || [])
      .map((id: any) => userMap.get(String(id)))
      .filter(Boolean),
  });
};

export const handleCommunityRequest = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const { communityId, studentId, action } = req.params;
  const community = await Community.findOne({ _id: communityId, teacherId });

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  community.joinRequests = (community.joinRequests || []).filter((id: any) => String(id) !== studentId) as any;
  if (action === "approve" && !(community.members || []).map(asId).includes(studentId)) {
    community.members.push(studentId as any);
  }
  await community.save();

  return res.json({ success: true });
};

export const listCommunityPosts = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"] as string;
  const userId = req.headers["x-user-id"] as string;
  const community = (await Community.findById(req.params.communityId).lean()) as any;

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const isTeacherOwner = role === "teacher" && String(community.teacherId) === userId;
  const isMember = (community.members || []).map(asId).includes(userId);
  if (!isTeacherOwner && !isMember) {
    return res.status(403).json({ message: "Join the community first" });
  }

  const posts = [...(community.posts || [])].sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const userMap = await getUserMap(
    Array.from(new Set(posts.map((post: any) => String(post.authorId)).filter(Boolean)))
  );

  return res.json({
    posts: posts.map((post: any) => ({
      ...post,
      author: {
        role: post.authorRole,
        name: userMap.get(String(post.authorId))?.name || (post.authorRole === "teacher" ? "Instructor" : "Student"),
      },
    })),
    totalPosts: posts.length,
  });
};

export const createCommunityPost = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const community = await Community.findOne({
    _id: req.params.communityId,
    teacherId,
    status: "approved",
  });

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  community.posts.push({
    authorId: teacherId,
    authorRole: "teacher",
    text: String(req.body.text || req.body.content || ""),
  } as any);
  await community.save();

  return res.status(201).json({ success: true });
};

export const updateCommunityPost = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const community = await Community.findOne({
    _id: req.params.communityId,
    teacherId,
  });

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const post = community.posts.id(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.set({ text: String(req.body.text || "") });
  await community.save();

  return res.json({ success: true });
};

export const deleteCommunityPost = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const community = await Community.findOne({
    _id: req.params.communityId,
    teacherId,
  });

  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const post = community.posts.id(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.deleteOne();
  await community.save();
  return res.json({ success: true });
};

export const listAnnouncements = async (req: Request, res: Response) => {
  const announcements = await Announcement.find({ courseId: req.params.courseId })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ announcements });
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const teacherId = req.headers["x-user-id"] as string;
  const course = await Course.findOne({ _id: req.params.courseId, teacherId }).lean();
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const announcement = await Announcement.create({
    teacherId,
    courseId: req.params.courseId,
    message: String(req.body.message || ""),
  });
  return res.status(201).json({ announcement });
};
