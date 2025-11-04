import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { checkInvitationToken } from "@/server/queries/invitation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/user-profile";
  const expectedEmail =
    url.searchParams.get("expectedEmail")?.trim().toLowerCase() || null;
  const inviteToken = url.searchParams.get("inviteToken")?.trim() || null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (expectedEmail || inviteToken) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const sessionEmail = user?.email?.toLowerCase() ?? null;

        if (expectedEmail && expectedEmail !== sessionEmail) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            new URL("/auth/auth-code-error?reason=email_mismatch", request.url),
          );
        }

        if (inviteToken) {
          const invitationResult = await checkInvitationToken(
            supabase,
            inviteToken,
          );

          if (
            !invitationResult.valid ||
            !invitationResult.invitation?.email ||
            (sessionEmail &&
              invitationResult.invitation.email !== sessionEmail)
          ) {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              new URL(
                "/auth/auth-code-error?reason=invalid_invite",
                request.url,
              ),
            );
          }
        }
      }

      const safeNext = next.startsWith("/") ? next : "/user-profile";
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
}
