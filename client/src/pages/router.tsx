import { createBrowserRouter } from "react-router-dom";
import HomePage from "./home/HomePage";
import AppLayout from "../components/layouts/AppLayout";
import HandleOAuthFailurePage from "../features/auth/components/HandleOAuth2FailurePage";
import HandleOAuthSuccessPage from "../features/auth/components/HandleOAuthSuccessPage";

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
    ],
  },
]);
