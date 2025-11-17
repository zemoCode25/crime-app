import { type NextRequest } from "next/server";
import { updateSession } from "@/server/supabase/middleware";
import { getUser } from "./server/actions/getUser";

export async function middleware(request: NextRequest) {
  // const user = await getUser();
  return await updateSession(request);
}

const protectedRoutes = ["/dashboard", "/settings"];

console.log("PROTECTED ROUTES:", protectedRoutes);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
