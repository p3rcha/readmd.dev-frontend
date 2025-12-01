import { RegisterForm } from '../components/RegisterForm';
import { AnimatedBackground } from '../../../components/common/AnimatedBackground';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground variant="auth" />
      
      {/* Register form */}
      <div className="relative z-10 w-full max-w-md px-6">
      <RegisterForm />
      </div>
    </div>
  );
}
