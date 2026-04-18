import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <UserProfile />
    </div>
  );
}