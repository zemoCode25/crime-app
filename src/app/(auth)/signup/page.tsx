import { SignUpForm } from "./_components/sign-up-form";
import { getInvitationForToken } from "@/server/actions/invitation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token: inviteToken } = await searchParams;
  const invitationResult = inviteToken
    ? await getInvitationForToken(inviteToken)
    : null;
  const invitation =
    invitationResult && invitationResult.ok ? invitationResult.data : undefined;

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-4">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignUpForm invitation={invitation} inviteToken={inviteToken} />
      </div>
    </div>
  );
}
