import { createBrowserRouter } from "react-router";
import AppLayout from "../components/layouts/AppLayout";
import HandleOAuthFailurePage from "../pages/HandleOAuth2FailurePage";
import HandleOAuthSuccessPage from "../pages/HandleOAuthSuccessPage";
import HomePage from "../pages/HomePage";
import CommunitiesPage from "../pages/CommunitiesPage";
import CommunityDetailPage from "../pages/CommunityDetailPage";

import {
  LoginForm,
  RegisterForm,
  NonAuthenticatedRoute,
} from "@/features/auth";
import {
  ProtoHomePage,
  ProtoCommunitiesListPage,
  ProtoCommunityPage,
  ProtoStudyYearPage,
  ProtoCoursePage,
} from "@/features/prototypes";

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
        path: "/communities",
        element: <CommunitiesPage />,
      },
      {
        path: "/communities/:communitySlug",
        element: <CommunityDetailPage />,
      },
      {
        path: "/oauth2/failure",
        element: <HandleOAuthFailurePage />,
      },
      {
        path: "/oauth2/success",
        element: <HandleOAuthSuccessPage />,
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
    ],
  },
]);
