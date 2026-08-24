import { Button } from "@/components/ui/button";
import { Logout, useAuthStore } from "@/features/auth/";
import { useNavigate } from "react-router";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  return <section></section>;
}
