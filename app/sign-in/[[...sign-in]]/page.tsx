import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      {/* Redirection vers le dashboard après connexion */}
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  );
}