import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

interface LoginViewProps {
  onLogin: () => void;
}

type AuthView = "login" | "signup" | "forgot-password";

export function LoginView({ onLogin }: LoginViewProps) {
  const { login } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(loginData.email, loginData.password);

      // Update Auth Context
      login(response.accessToken, response.user);

      toast.success("Welcome back! Logging you in...");
      // onLogin is likely not needed if AuthContext updates state that App.tsx reacts to,
      // but we call it just in case logic depends on it.
      onLogin();

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!signupData.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!");
      setTimeout(() => {
        onLogin();
      }, 500);
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password reset link sent to your email!");
      setCurrentView("login");
      setForgotPasswordEmail("");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = 'http://localhost:3001/auth/google';
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      handleGoogleLogin();
    } else {
      toast.info(`${provider} login coming soon...`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />

      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl tracking-tight text-foreground font-bold font-display">Civsesor</h1>
              <p className="text-muted-foreground font-medium">Portfolio Manager</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl text-foreground font-bold font-display">Manage Your Investments with Confidence</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Track portfolios, analyze performance, and make informed investment decisions with our professional-grade platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-10">
            {[
              { label: "No Trading Account Linked", icon: "/assets/icons/feature-security.png" },
              { label: "No Hidden Fees", icon: "/assets/icons/feature-pricing.png" },
              { label: "Cancel Anytime", icon: "/assets/icons/feature-flexibility.png" },
              { label: "Priority Support", icon: "/assets/icons/feature-support.png" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-6 px-6 py-10 rounded-[2rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden">
                {/* Subtle background flare on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-500/0 group-hover:from-cyan-500/[0.03] group-hover:to-blue-500/[0.03] transition-colors duration-500" />

                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center relative group-hover:bg-cyan-50 transition-colors duration-500">
                  {/* Icon glow */}
                  <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 blur-xl rounded-full transition-all duration-500" />
                  <img src={item.icon} alt={item.label} className="w-12 h-12 object-contain relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" />
                </div>

                <span className="text-slate-900 font-display font-bold text-lg leading-tight tracking-tight relative z-10">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <Card className="bg-card border-border p-8 backdrop-blur-xl shadow-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl tracking-tight text-foreground font-bold font-display">Civsesor</h1>
              <p className="text-xs text-muted-foreground">Portfolio Manager</p>
            </div>
          </div>

          {/* Login Form */}
          {currentView === "login" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2 text-foreground font-semibold">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked: any) => setRememberMe(checked as boolean)}
                      className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="remember" className="text-sm cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView("forgot-password")}
                    className="text-sm text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="relative py-4">
                <Separator className="bg-border" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border hover:border-cyan-500 hover:bg-accent flex items-center justify-center gap-2 py-6 transition-all text-foreground"
                onClick={() => handleSocialLogin("Google")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-foreground font-semibold">Sign in with Google</span>
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => setCurrentView("signup")}
                  className="text-cyan-500 hover:text-cyan-600 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* Signup Form */}
          {currentView === "signup" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView("login")}
                  className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-2xl text-foreground font-semibold">Create Account</h2>
                  <p className="text-sm text-muted-foreground">Start managing your investments today</p>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      className="bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      className="bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10 pr-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={signupData.acceptTerms}
                    onCheckedChange={(checked: any) => setSignupData({ ...signupData, acceptTerms: checked as boolean })}
                    className="border-border data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <a href="#" className="text-cyan-500 hover:text-cyan-600 font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-cyan-500 hover:text-cyan-600 font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setCurrentView("login")}
                  className="text-cyan-500 hover:text-cyan-600 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* Forgot Password Form */}
          {currentView === "forgot-password" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView("login")}
                  className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-2xl text-foreground font-semibold">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">We'll send you a reset link</p>
                </div>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="pl-10 bg-accent/20 border-border focus:border-cyan-500 text-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <button
                  onClick={() => setCurrentView("login")}
                  className="text-cyan-500 hover:text-cyan-600 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* Footer */}
        </Card>
      </div>

      {/* Page Footer */}
      <footer className="absolute bottom-0 left-0 w-full py-8 border-t border-white/5 backdrop-blur-md bg-background/30 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm text-foreground/80 font-semibold italic">
                Need support? Call <a href="tel:1900xxx" className="text-cyan-400 hover:underline">1900 xxx</a> or email <a href="mailto:support@civsesor.com" className="text-cyan-400 hover:underline">support@civsesor.com</a>
              </p>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-4 bg-white/10" />
            <p className="text-xs text-muted-foreground/60 font-medium">
              We respond during business hours.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-muted-foreground/40 font-bold tracking-[0.2em]">
              © 2026 Civsesor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

