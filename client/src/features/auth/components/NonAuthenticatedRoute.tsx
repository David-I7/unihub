import { Navigate } from "react-router";
import useAuthStore from "../store/useAuthStore";

export default function NonAuthenticatedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (user !== null) {
    return <Navigate to="/" replace />;
  }

  return children;
}
