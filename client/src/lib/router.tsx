import { createBrowserRouter } from "react-router";
import AppLayout from "../components/layouts/AppLayout";
import OAuth2CallbackPage from "../pages/OAuth2CallbackPage";
import HomePage from "../pages/HomePage";
import CommunitiesPage from "../pages/CommunitiesPage";
import CommunityDetailPage from "../pages/CommunityDetailPage";
import StudyYearDetailPage from "../pages/StudyYearDetailPage";
import CourseDetailPage from "../pages/CourseDetailPage";
import CalendarPage from "../pages/CalendarPage";

import {
  LoginForm,
  RegisterForm,
  NonAuthenticatedRoute,
  AuthenticatedRoute,
} from "@/features/auth";
import {
  ProtoHomePage,
  ProtoCommunitiesListPage,
  ProtoCommunityPage,
  ProtoStudyYearPage,
  ProtoCoursePage,
  ProtoCalendarPage,
  ProtoTeachersPage,
} from "@/features/prototypes";


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
        path: "/proto",
        element: <ProtoHomePage />,
      },
      {
        path: "/proto/communities",
        element: <ProtoCommunitiesListPage />,
      },
      {
        path: "/proto/communities/:communityId",
        element: <ProtoCommunityPage />,
      },
      {
        path: "/proto/communities/:communityId/year/:yearId",
        element: <ProtoStudyYearPage />,
      },
      {
        path: "/proto/communities/:communityId/year/:yearId/course/:courseOfferingId",
        element: <ProtoCoursePage />,
      },
      {
        path: "/proto/teachers",
        element: <ProtoTeachersPage />,
      },
      {
        path: "/proto/calendar",
        element: <ProtoCalendarPage />,
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
