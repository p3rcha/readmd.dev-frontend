import { LoginForm } from '../components/LoginForm';
import { AnimatedBackground } from '../../../components/common/AnimatedBackground';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground variant="auth" />
      
      {/* Login form */}
      <div className="relative z-10 w-full max-w-md px-6">
      <LoginForm />
      </div>
    </div>
  );
}
