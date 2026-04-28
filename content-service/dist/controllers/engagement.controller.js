"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnnouncement = exports.listAnnouncements = exports.deleteCommunityPost = exports.updateCommunityPost = exports.createCommunityPost = exports.listCommunityPosts = exports.handleCommunityRequest = exports.listCommunityRequests = exports.joinCommunity = exports.createCommunity = exports.listCommunities = exports.removeWishlistItem = exports.addWishlistItem = exports.listWishlist = exports.replyToQuestion = exports.listTeacherQuestions = exports.askQuestion = exports.listCourseQuestions = exports.deleteNote = exports.updateNote = exports.createNote = exports.listNotes = exports.upsertCourseReview = exports.getMyCourses = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = require("../models/course.model");
const dashboard_model_1 = require("../models/dashboard.model");
const external_user_model_1 = require("../models/external-user.model");
const note_model_1 = require("../models/note.model");
const question_model_1 = require("../models/question.model");
const review_model_1 = require("../models/review.model");
const wishlist_model_1 = require("../models/wishlist.model");
const community_model_1 = require("../models/community.model");
const announcement_model_1 = require("../models/announcement.model");
const asId = (value) => String(value);
const getTeacherCourseIds = async (teacherId) => {
    const courses = await course_model_1.Course.find({ teacherId }).select("_id").lean();
    return courses.map((course) => String(course._id));
};
const getUserMap = async (userIds) => {
    if (!userIds.length)
        return new Map();
    const users = await external_user_model_1.ExternalUser.find({ _id: { $in: userIds } }).lean();
    return new Map(users.map((user) => [String(user._id), user]));
};
const getMyCourses = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const enrollments = await dashboard_model_1.Enrollment.find({ studentId }).sort({ updatedAt: -1 }).lean();
    const courseIds = enrollments.map((item) => item.courseId);
    const courses = courseIds.length ? await course_model_1.Course.find({ _id: { $in: courseIds } }).lean() : [];
    const courseMap = new Map(courses.map((course) => [String(course._id), course]));
    const teacherMap = await getUserMap(Array.from(new Set(courses.map((course) => String(course.teacherId)).filter(Boolean))));
    const enrolledCourses = enrollments
        .map((enrollment) => {
        const course = courseMap.get(String(enrollment.courseId));
        if (!course)
            return null;
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
exports.getMyCourses = getMyCourses;
const upsertCourseReview = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const { rating, comment } = req.body;
    if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const enrollment = await dashboard_model_1.Enrollment.findOne({
        studentId,
        courseId: req.params.courseId,
    }).lean();
    if (!enrollment) {
        return res.status(403).json({ message: "Enroll before reviewing this course" });
    }
    await review_model_1.Review.findOneAndUpdate({ studentId, courseId: req.params.courseId }, {
        studentId,
        courseId: req.params.courseId,
        rating: Number(rating || 0),
        comment: String(comment || ""),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const reviews = await review_model_1.Review.find({ courseId: req.params.courseId }).lean();
    const ratingAvg = reviews.length
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
            reviews.length
        : 0;
    await course_model_1.Course.findByIdAndUpdate(req.params.courseId, {
        ratingAvg: Number(ratingAvg.toFixed(1)),
        ratingCount: reviews.length,
    });
    return res.json({ success: true });
};
exports.upsertCourseReview = upsertCourseReview;
const listNotes = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const notes = await note_model_1.Note.find({ studentId, courseId: req.params.courseId })
        .sort({ updatedAt: -1 })
        .lean();
    return res.json(notes);
};
exports.listNotes = listNotes;
const createNote = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const note = await note_model_1.Note.create({
        studentId,
        courseId: req.params.courseId,
        content: String(req.body.content || ""),
    });
    return res.status(201).json({ note });
};
exports.createNote = createNote;
const updateNote = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const note = await note_model_1.Note.findOneAndUpdate({ _id: req.params.noteId, studentId, courseId: req.params.courseId }, { content: String(req.body.content || "") }, { new: true }).lean();
    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }
    return res.json({ note });
};
exports.updateNote = updateNote;
const deleteNote = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    await note_model_1.Note.findOneAndDelete({
        _id: req.params.noteId,
        studentId,
        courseId: req.params.courseId,
    });
    return res.json({ success: true });
};
exports.deleteNote = deleteNote;
const listCourseQuestions = async (req, res) => {
    const questions = await question_model_1.Question.find({ courseId: req.params.courseId })
        .sort({ createdAt: -1 })
        .lean();
    const userMap = await getUserMap(Array.from(new Set(questions.map((question) => question.studentId).filter(Boolean))));
    return res.json({
        questions: questions.map((question) => ({
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
exports.listCourseQuestions = listCourseQuestions;
const askQuestion = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const question = await question_model_1.Question.create({
        studentId,
        courseId: req.params.courseId,
        lessonId: req.body.lessonId || null,
        question: String(req.body.question || ""),
    });
    return res.status(201).json({ question });
};
exports.askQuestion = askQuestion;
const listTeacherQuestions = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const courseIds = await getTeacherCourseIds(teacherId);
    const questions = courseIds.length
        ? await question_model_1.Question.find({ courseId: { $in: courseIds } }).sort({ createdAt: -1 }).lean()
        : [];
    const userMap = await getUserMap(Array.from(new Set(questions.map((question) => question.studentId).filter(Boolean))));
    return res.json(questions.map((question) => ({
        ...question,
        student: userMap.get(String(question.studentId))
            ? {
                name: userMap.get(String(question.studentId)).name,
                email: userMap.get(String(question.studentId)).email,
            }
            : { name: "Student" },
    })));
};
exports.listTeacherQuestions = listTeacherQuestions;
const replyToQuestion = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const courseIds = await getTeacherCourseIds(teacherId);
    const question = await question_model_1.Question.findOneAndUpdate({ _id: req.params.qnaId, courseId: { $in: courseIds } }, { reply: String(req.body.reply || ""), repliedBy: teacherId }, { new: true }).lean();
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    return res.json({ question });
};
exports.replyToQuestion = replyToQuestion;
const listWishlist = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const items = await wishlist_model_1.Wishlist.find({ studentId }).sort({ createdAt: -1 }).lean();
    const courseIds = items.map((item) => item.courseId);
    const courses = courseIds.length ? await course_model_1.Course.find({ _id: { $in: courseIds } }).lean() : [];
    const courseMap = new Map(courses.map((course) => [String(course._id), course]));
    const teacherMap = await getUserMap(Array.from(new Set(courses.map((course) => String(course.teacherId)).filter(Boolean))));
    return res.json({
        wishlist: items
            .map((item) => {
            const course = courseMap.get(String(item.courseId));
            if (!course)
                return null;
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
exports.listWishlist = listWishlist;
const addWishlistItem = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const courseId = String(req.body.courseId || req.params.courseId || "");
    if (!studentId) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const course = await course_model_1.Course.findOne({
        status: "published",
        $or: [
            ...(mongoose_1.default.Types.ObjectId.isValid(courseId) ? [{ _id: courseId }] : []),
            { slug: courseId },
        ],
    }).lean();
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    await wishlist_model_1.Wishlist.findOneAndUpdate({ studentId, courseId: String(course._id) }, { studentId, courseId: String(course._id) }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.status(201).json({ success: true });
};
exports.addWishlistItem = addWishlistItem;
const removeWishlistItem = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    await wishlist_model_1.Wishlist.findOneAndDelete({ studentId, courseId: req.params.courseId });
    return res.json({ success: true });
};
exports.removeWishlistItem = removeWishlistItem;
const listCommunities = async (req, res) => {
    const role = req.headers["x-user-role"];
    const userId = req.headers["x-user-id"];
    const communities = role === "teacher"
        ? await community_model_1.Community.find({ teacherId: userId }).sort({ createdAt: -1 }).lean()
        : await community_model_1.Community.find({ status: "approved" }).sort({ createdAt: -1 }).lean();
    return res.json(communities.map((community) => ({
        ...community,
        isApproved: community.status === "approved",
    })));
};
exports.listCommunities = listCommunities;
const createCommunity = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const community = await community_model_1.Community.create({
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
exports.createCommunity = createCommunity;
const joinCommunity = async (req, res) => {
    const studentId = req.headers["x-user-id"];
    const community = await community_model_1.Community.findById(req.params.communityId);
    if (!community || community.status !== "approved") {
        return res.status(404).json({ message: "Community not available" });
    }
    if (!community.members.map(asId).includes(studentId) && !community.joinRequests.map(asId).includes(studentId)) {
        community.joinRequests.push(studentId);
        await community.save();
    }
    return res.json({ success: true });
};
exports.joinCommunity = joinCommunity;
const listCommunityRequests = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const community = (await community_model_1.Community.findOne({
        _id: req.params.communityId,
        teacherId,
    }).lean());
    if (!community) {
        return res.status(404).json({ message: "Community not found" });
    }
    const userMap = await getUserMap((community.joinRequests || []).map((id) => String(id)));
    return res.json({
        joinRequests: (community.joinRequests || [])
            .map((id) => userMap.get(String(id)))
            .filter(Boolean),
    });
};
exports.listCommunityRequests = listCommunityRequests;
const handleCommunityRequest = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const { communityId, studentId, action } = req.params;
    const community = await community_model_1.Community.findOne({ _id: communityId, teacherId });
    if (!community) {
        return res.status(404).json({ message: "Community not found" });
    }
    community.joinRequests = (community.joinRequests || []).filter((id) => String(id) !== studentId);
    if (action === "approve" && !(community.members || []).map(asId).includes(studentId)) {
        community.members.push(studentId);
    }
    await community.save();
    return res.json({ success: true });
};
exports.handleCommunityRequest = handleCommunityRequest;
const listCommunityPosts = async (req, res) => {
    const role = req.headers["x-user-role"];
    const userId = req.headers["x-user-id"];
    const community = (await community_model_1.Community.findById(req.params.communityId).lean());
    if (!community) {
        return res.status(404).json({ message: "Community not found" });
    }
    const isTeacherOwner = role === "teacher" && String(community.teacherId) === userId;
    const isMember = (community.members || []).map(asId).includes(userId);
    if (!isTeacherOwner && !isMember) {
        return res.status(403).json({ message: "Join the community first" });
    }
    const posts = [...(community.posts || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const userMap = await getUserMap(Array.from(new Set(posts.map((post) => String(post.authorId)).filter(Boolean))));
    return res.json({
        posts: posts.map((post) => ({
            ...post,
            author: {
                role: post.authorRole,
                name: userMap.get(String(post.authorId))?.name || (post.authorRole === "teacher" ? "Instructor" : "Student"),
            },
        })),
        totalPosts: posts.length,
    });
};
exports.listCommunityPosts = listCommunityPosts;
const createCommunityPost = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const community = await community_model_1.Community.findOne({
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
    });
    await community.save();
    return res.status(201).json({ success: true });
};
exports.createCommunityPost = createCommunityPost;
const updateCommunityPost = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const community = await community_model_1.Community.findOne({
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
exports.updateCommunityPost = updateCommunityPost;
const deleteCommunityPost = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const community = await community_model_1.Community.findOne({
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
exports.deleteCommunityPost = deleteCommunityPost;
const listAnnouncements = async (req, res) => {
    const announcements = await announcement_model_1.Announcement.find({ courseId: req.params.courseId })
        .sort({ createdAt: -1 })
        .lean();
    return res.json({ announcements });
};
exports.listAnnouncements = listAnnouncements;
const createAnnouncement = async (req, res) => {
    const teacherId = req.headers["x-user-id"];
    const course = await course_model_1.Course.findOne({ _id: req.params.courseId, teacherId }).lean();
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const announcement = await announcement_model_1.Announcement.create({
        teacherId,
        courseId: req.params.courseId,
        message: String(req.body.message || ""),
    });
    return res.status(201).json({ announcement });
};
exports.createAnnouncement = createAnnouncement;
