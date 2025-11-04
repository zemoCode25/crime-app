import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service-client";
import type { TablesInsert } from "@/server/supabase/database.types";
import { checkInvitationToken } from "@/server/queries/invitation";
import { getUser } from "@/server/actions/getUser";

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
        const user = await getUser();
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

          const invitation = invitationResult.invitation;
          const userId = user?.id ?? null;

          if (!userId) {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              new URL(
                "/auth/auth-code-error?reason=missing_user",
                request.url,
              ),
            );
          }

          const serviceClient = createServiceClient();
          const userPayload: TablesInsert<"users"> = {
            id: userId,
            role: invitation.role,
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            barangay: invitation?.barangay,
          };

          const { error: upsertError } = await serviceClient
            .from("users")
            .upsert(userPayload, { onConflict: "id" });

          if (upsertError) {
            console.error("Failed to upsert user record for Google signup", upsertError);
            await supabase.auth.signOut();
            return NextResponse.redirect(
              new URL(
                "/auth/auth-code-error?reason=profile_setup_failed",
                request.url,
              ),
            );
          }

          const { error: invitationUpdateError } = await serviceClient
            .from("invitation")
            .update({ consumed_datetime: new Date().toISOString() })
            .eq("id", invitation.id);

          if (invitationUpdateError) {
            console.error("Failed to mark invitation as consumed after Google signup", invitationUpdateError);
            await supabase.auth.signOut();
            return NextResponse.redirect(
              new URL(
                "/auth/auth-code-error?reason=profile_setup_failed",
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
