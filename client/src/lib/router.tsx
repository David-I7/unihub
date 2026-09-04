import { createBrowserRouter } from "react-router";
import AppLayout from "../components/layouts/AppLayout";
import OAuth2CallbackPage from "../pages/OAuth2CallbackPage";
import HomePage from "../pages/HomePage";
import CommunitiesPage from "../pages/CommunitiesPage";
import CommunityDetailPage from "../pages/CommunityDetailPage";
import CommunityJoinPage from "../pages/CommunityJoinPage";
import StudyYearDetailPage from "../pages/StudyYearDetailPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import CalendarPage from "../pages/CalendarPage";
import NotificationsPage from "../pages/NotificationsPage";

import {
  LoginForm,
  RegisterForm,
  NonAuthenticatedRoute,
  AuthenticatedRoute,
} from "@/features/auth";
import ResetPasswordPage from "../pages/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <AuthenticatedRoute
            title="Welcome to Unihub"
            description="Sign in to join communities, share resources, and schedule event reminders."
          >
            <HomePage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/calendar",
        element: (
          <AuthenticatedRoute
            title="Calendar"
            description="Sign in to view your upcoming exams, assignment deadlines, and class schedules."
          >
            <CalendarPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <AuthenticatedRoute
            title="Notifications"
            description="Sign in to check your latest activity alerts, event updates, and reminders."
          >
            <NotificationsPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/communities",
        element: <CommunitiesPage />,
      },
      {
        path: "/communities/:communitySlug/join",
        element: (
          <AuthenticatedRoute
            title="Join Community"
            description="Sign in to join a community using a join code."
          >
            <CommunityJoinPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/communities/:communitySlug",
        element: <CommunityDetailPage />,
      },
      {
        path: "/communities/:communitySlug/study-years/:studyYearSlug",
        element: <StudyYearDetailPage />,
      },
      {
        path: "/communities/:communitySlug/study-years/:studyYearSlug/courses/:courseSlug",
        element: <CourseDetailPage />,
      },
      {
        path: "/oauth2",
        element: <OAuth2CallbackPage />,
      },
      {
        path: "/login",
        element: (
          <NonAuthenticatedRoute>
            <LoginForm />
          </NonAuthenticatedRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <NonAuthenticatedRoute>
            <RegisterForm />
          </NonAuthenticatedRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <NonAuthenticatedRoute>
            <ResetPasswordPage />
          </NonAuthenticatedRoute>
        ),
      },
    ],
  },
]);
