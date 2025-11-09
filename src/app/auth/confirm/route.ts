import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/server/supabase/server";
import { redirect } from "next/navigation";
import { getUser } from "@/server/actions/getUser";
import { checkInvitationToken, getActiveInvitationForEmail } from "@/server/queries/invitation";
import { createServiceClient } from "@/server/supabase/service-client";
import type { TablesInsert } from "@/server/supabase/database.types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const inviteToken = searchParams.get("inviteToken");
  // const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // If this confirmation came from an invitation-based signup, finalize user profile
      if (inviteToken) {
        const user = await getUser();
        const sessionEmail = user?.email?.toLowerCase() ?? null;

        const invitationResult = await checkInvitationToken(supabase, inviteToken);
        const invitationEmail = invitationResult.invitation?.email?.toLowerCase() ?? null;

        if (
          !invitationResult.valid ||
          !invitationEmail ||
          !user?.id ||
          (sessionEmail && sessionEmail !== invitationEmail)
        ) {
          await supabase.auth.signOut();
          redirect("/auth/auth-code-error?reason=invalid_invite");
        }

        const invitation = invitationResult.invitation!;
        const serviceClient = createServiceClient();
        const userPayload: TablesInsert<"users"> = {
          id: user!.id,
          role: invitation.role,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          barangay: invitation.barangay,
        };

        const { error: upsertError } = await serviceClient
          .from("users")
          .upsert(userPayload, { onConflict: "id" });

        if (upsertError) {
          console.error("Failed to upsert user record during email confirm", upsertError);
          await supabase.auth.signOut();
          redirect("/auth/auth-code-error?reason=profile_setup_failed");
        }

        const { error: invitationUpdateError } = await serviceClient
          .from("invitation")
          .update({ consumed_datetime: new Date().toISOString() })
          .eq("id", invitation.id);

        if (invitationUpdateError) {
          console.error("Failed to mark invitation as consumed during email confirm", invitationUpdateError);
          await supabase.auth.signOut();
          redirect("/auth/auth-code-error?reason=profile_setup_failed");
        }
      } else {
        // Fallback: No inviteToken in URL; try to resolve invitation by email
        const user = await getUser();
        const sessionEmail = user?.email?.toLowerCase() ?? null;

        if (sessionEmail && user?.id) {
          const invitationResult = await getActiveInvitationForEmail(
            supabase,
            sessionEmail,
          );

          if (!invitationResult.valid || !invitationResult.invitation) {
            await (await createClient()).auth.signOut();
            redirect("/auth/auth-code-error?reason=invalid_invite");
          }

          const invitation = invitationResult.invitation;
          const serviceClient = createServiceClient();
          const userPayload: TablesInsert<"users"> = {
            id: user.id,
            role: invitation.role,
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            barangay: invitation.barangay,
          };

          const { error: upsertError } = await serviceClient
            .from("users")
            .upsert(userPayload, { onConflict: "id" });

          if (upsertError) {
            console.error("Failed to upsert user record during email confirm (fallback)", upsertError);
            await supabase.auth.signOut();
            redirect("/auth/auth-code-error?reason=profile_setup_failed");
          }

          const { error: invitationUpdateError } = await serviceClient
            .from("invitation")
            .update({ consumed_datetime: new Date().toISOString() })
            .eq("id", invitation.id);

          if (invitationUpdateError) {
            console.error("Failed to mark invitation as consumed during email confirm (fallback)", invitationUpdateError);
            await supabase.auth.signOut();
            redirect("/auth/auth-code-error?reason=profile_setup_failed");
          }
        }
      }

      // redirect user to dashboard after successful confirmation
      redirect("/dashboard");
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
