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
        element: <HomePage />,
      },
      {
        path: "/calendar",
        element: (
          <AuthenticatedRoute>
            <CalendarPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "/communities",
        element: <CommunitiesPage />,
      },
      {
        path: "/communities/:communitySlug/join",
        element: <CommunityJoinPage />,
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
