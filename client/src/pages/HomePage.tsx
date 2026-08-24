import { Button } from "@/components/ui/button";
import { Logout, useAuthStore } from "@/features/auth/";
import { useNavigate } from "react-router";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  console.log("AUTH STORE USER: ", user);
  console.log("AUTH STORE ACCESS TOKEN: ", accessToken);
  const navigate = useNavigate();
  return (
    <section>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
      {user ? (
        <>
          <p>You are logged in as {user.username}</p>
          <Logout />
        </>
      ) : (
        <>
          <p>Please log in to view your profile.</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
          <Button onClick={() => navigate("/register")}>Register</Button>
        </>
      )}
    </section>
  );
}
