import AuthLayout from "@/layouts/auth-layout";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <AuthLayout>
      <div>
        <SignupForm />
      </div>
    </AuthLayout>
  );
}
