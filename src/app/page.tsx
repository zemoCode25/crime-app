import { redirect } from "next/navigation";
import { getUser } from "@/server/actions/getUser";

export default async function Page() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  } else {
    redirect("/dashboard");
  }
}
