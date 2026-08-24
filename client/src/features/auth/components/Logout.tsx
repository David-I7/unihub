import { Button } from "@/components/ui/button";
import { useLogout } from "../api/logout";
import { Spinner } from "@/components/ui/spinner";

export default function Logout() {
  const { mutate, status } = useLogout();

  return (
    <Button
      disabled={status === "pending"}
      onClick={() => {
        if (status === "idle") {
          mutate();
        }
      }}
    >
      {status === "pending" ? <Spinner /> : "Logout"}
    </Button>
  );
}
