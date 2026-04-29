import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4efe7] px-4">
      <UserProfile path="/profile" routing="path" />
    </div>
  );
}
