import ProfileClient from "./ProfileClient";
import { fetchProfile } from "@/server/actions/profile";

export default async function Profile() {
  const { user, profile } = await fetchProfile();

  const email = user?.email ?? "";

  return (
    <ProfileClient
      email={email}
      role={profile?.role ?? null}
      firstName={profile?.first_name ?? null}
      lastName={profile?.last_name ?? null}
      contactNumber={profile?.contact_number ?? null}
    />
  );
}
