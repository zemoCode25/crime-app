import DashboardPage from "./components/DashboardPage";
import { getUser } from "@/server/actions/getUser";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getUser();
  console.log(user);
  return <DashboardPage />;
}
