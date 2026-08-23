import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import AppLayout from "../components/layouts/AppLayout";
import HandleOAuthFailurePage from "../pages/HandleOAuth2FailurePage";
import HandleOAuthSuccessPage from "../pages/HandleOAuthSuccessPage";
import {
  LoginForm,
  RegisterForm,
  NonAuthenticatedRoute,
} from "@/features/auth";

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
