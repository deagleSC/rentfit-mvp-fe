import AuthLayout from "@/layouts/auth-layout";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <div>
        <LoginForm />
      </div>
    </AuthLayout>
  );
}
