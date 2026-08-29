import type { Post } from "@/types/domain";

/**
 * Temporary mock posts and comments for UI inspection.
 * Delete or disable via USE_MOCK_POSTS in CommunityPostsTab.tsx when ready.
 */
export const MOCK_COMMUNITY_POSTS: Post[] = [
  {
    id: "mock-post-1",
    title: "Welcome to the Community! Rules, Resources & Syllabus Guidelines",
    description:
      "Welcome to all students and educators! Please review the pinned links for course syllabi, lab guidelines, and exam exemptions.\n\nBe respectful and keep all course material discussions in the respective channels.",
    channel: "COMMUNITY",
    pinned: true,
    likesCount: 24,
    commentsCount: 3,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
    owner: {
      id: "owner-1",
      username: "iosub_david",
      active: true,
    },
    comments: [
      {
        id: "mock-comment-1",
        postId: "mock-post-1",
        content: "Glad to join! Are the Year 1 lab materials already up to date?",
        createdAt: "2026-08-20T10:15:00.000Z",
        updatedAt: "2026-08-20T10:15:00.000Z",
        owner: {
          id: "user-alex",
          username: "alexandra_m",
          active: true,
        },
      },
      {
        id: "mock-comment-2",
        postId: "mock-post-1",
        content: "Yes! Check the Study Years tab under Year 1.",
        createdAt: "2026-08-20T10:30:00.000Z",
        updatedAt: "2026-08-20T10:30:00.000Z",
        owner: {
          id: "owner-1",
          username: "iosub_david",
          active: true,
        },
      },
      {
        id: "mock-comment-3",
        postId: "mock-post-1",
        content: "Thanks for putting this community together!",
        createdAt: "2026-08-20T11:00:00.000Z",
        updatedAt: "2026-08-20T11:00:00.000Z",
        owner: {
          id: "user-marius",
          username: "marius_pop",
          active: true,
        },
      },
    ],
  },
  {
    id: "mock-post-2",
    title: "Exam Preparation Tips: MIPS Project & Assembly Architecture",
    description:
      "For those taking ASC this semester: scoring >= 5 on the MIPS practical project guarantees passing without mandatory attendance at the written session exam. Make sure your stack alignment is clean in Mars!",
    channel: "COURSE_OFFERING",
    pinned: false,
    likesCount: 18,
    commentsCount: 2,
    createdAt: "2026-08-22T14:30:00.000Z",
    updatedAt: "2026-08-22T14:30:00.000Z",
    owner: {
      id: "user-radu",
      username: "radu_ionescu",
      active: true,
    },
    comments: [
      {
        id: "mock-comment-4",
        postId: "mock-post-2",
        content: "Does Mars simulator work on macOS Apple Silicon natively?",
        createdAt: "2026-08-22T15:10:00.000Z",
        updatedAt: "2026-08-22T15:10:00.000Z",
        owner: {
          id: "user-elena",
          username: "elena_v",
          active: true,
        },
      },
      {
        id: "mock-comment-5",
        postId: "mock-post-2",
        content: "Yes, run `java -jar Mars4_5.jar` with Java 17+ and it runs seamlessly.",
        createdAt: "2026-08-22T15:25:00.000Z",
        updatedAt: "2026-08-22T15:25:00.000Z",
        owner: {
          id: "user-radu",
          username: "radu_ionescu",
          active: true,
        },
      },
    ],
  },
  {
    id: "mock-post-3",
    title: "Campus Hackathon & Study Group Formation for Fall 2026",
    description:
      "We are putting together cross-year teams for the upcoming university hackathon next month. Drop a comment below if you are interested in backend (Java / Go / Spring Boot) or frontend (React / Tailwind).",
    channel: "GENERAL",
    pinned: false,
    likesCount: 31,
    commentsCount: 1,
    createdAt: "2026-08-24T09:00:00.000Z",
    updatedAt: "2026-08-24T09:00:00.000Z",
    owner: {
      id: "user-matei",
      username: "matei_dev",
      active: true,
    },
    comments: [
      {
        id: "mock-comment-6",
        postId: "mock-post-3",
        content: "I'd love to join as a fullstack dev! Sending you a message.",
        createdAt: "2026-08-24T09:45:00.000Z",
        updatedAt: "2026-08-24T09:45:00.000Z",
        owner: {
          id: "user-diana",
          username: "diana_s",
          active: true,
        },
      },
    ],
  },
];
