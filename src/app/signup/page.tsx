import { signup } from "@/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
