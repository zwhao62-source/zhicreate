import { AuthForm } from '@/components/membership/auth-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-orange-950 dark:via-slate-950 dark:to-red-950">
      <AuthForm defaultTab="register" />
    </div>
  );
}
