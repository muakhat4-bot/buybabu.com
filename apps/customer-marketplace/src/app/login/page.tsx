'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@villex/ui';
import { Navbar } from '@/components/layout/navbar';
import { useCustomerAuth } from '@/context/customer-auth-context';

function LoginFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInWithPhoneOtp, 
    verifyPhoneOtp,
    isLoggedIn 
  } = useCustomerAuth();

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'signin';
  const [activeTab, setActiveTab] = React.useState<'signin' | 'phone' | 'register'>(initialTab as any);

  // Email form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  // Register form states
  const [regFirstName, setRegFirstName] = React.useState('');
  const [regLastName, setRegLastName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');

  // Phone OTP states
  const [phone, setPhone] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpToken, setOtpToken] = React.useState('');

  // UI feedback states
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const { error } = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Login failed. Please check your credentials.');
    } else {
      setSuccessMsg('Successfully signed in! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const { error } = await signUpWithEmail(regEmail, regPassword, regFirstName, regLastName, regPhone);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Registration failed. Please try again.');
    } else {
      setSuccessMsg('Registration successful! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    // Format phone to international structure if needed (ensure it starts with +)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const { error } = await signInWithPhoneOtp(formattedPhone);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to send OTP code. Please check your number.');
    } else {
      setOtpSent(true);
      setSuccessMsg('OTP code sent successfully to ' + formattedPhone);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const { error } = await verifyPhoneOtp(formattedPhone, otpToken);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid or expired OTP code.');
    } else {
      setSuccessMsg('Phone verified successfully! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden bg-card/5">
        {/* Decorative background glow elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-warning/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full max-w-md z-10 space-y-6">
          <Card glass className="shadow-2xl border border-border/80">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {activeTab === 'signin' && 'Welcome Back'}
                {activeTab === 'phone' && 'Mobile OTP Sign In'}
                {activeTab === 'register' && 'Create Account'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'signin' && 'Sign in to access your orders and profile'}
                {activeTab === 'phone' && 'Authenticate using verification code'}
                {activeTab === 'register' && 'Sign up to start buying on Villex'}
              </CardDescription>
            </CardHeader>

            {/* Custom Tab Selectors */}
            <div className="px-6 flex border-b border-border">
              <button
                onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'signin' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('phone'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'phone' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Mobile OTP
              </button>
              <button
                onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>

            <CardContent className="pt-6">
              {/* Alert Feedback boxes */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. SIGN IN FORM */}
              {activeTab === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="bg-secondary/15 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                      <a href="#" className="text-xs text-primary hover:underline font-semibold">Forgot Password?</a>
                    </div>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-secondary/15 rounded-xl h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Prominent divider and Register button per request */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
                      <span className="bg-card px-2.5 text-muted-foreground">Don't have an account?</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Create Account
                  </Button>
                </form>
              )}

              {/* 2. PHONE OTP FORM */}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handlePhoneRequestOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
                        <Input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+923001234567"
                          className="bg-secondary/15 rounded-xl h-11"
                        />
                        <span className="text-[10px] text-muted-foreground">Enter number with international format (e.g. +92...)</span>
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending code...
                          </>
                        ) : (
                          'Send Verification OTP'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneVerifyOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enter OTP Code</label>
                        <Input
                          type="text"
                          required
                          value={otpToken}
                          onChange={(e) => setOtpToken(e.target.value)}
                          placeholder="123456"
                          className="bg-secondary/15 rounded-xl h-11 text-center text-lg tracking-widest font-mono"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                          </>
                        ) : (
                          'Verify OTP Code'
                        )}
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setOtpToken(''); setErrorMsg(''); }}
                          className="text-xs text-primary hover:underline font-bold focus:outline-none"
                        >
                          ← Change Phone Number
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 3. REGISTER FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</label>
                      <Input
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="John"
                        className="bg-secondary/15 rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</label>
                      <Input
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Doe"
                        className="bg-secondary/15 rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="bg-secondary/15 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number (Optional)</label>
                    <Input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+923001234567"
                      className="bg-secondary/15 rounded-xl h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                    <Input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-secondary/15 rounded-xl h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Already have an account divider per request */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
                      <span className="bg-card px-2.5 text-muted-foreground">Already have an account?</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-secondary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Sign In
                  </Button>
                </form>
              )}

              {/* Divider for OAuth */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
                  <span className="bg-card px-2.5 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 h-11 rounded-xl border border-border bg-card hover:bg-secondary/35 hover:scale-[1.01] active:scale-[0.99] text-xs font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.35 1 3.4 3.67 1.5 7.57l3.9 3.02c.9-2.73 3.45-4.55 6.6-4.55z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.45 12.3c0-.82-.07-1.6-.22-2.3H12v4.35h6.42c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.71-4.94 3.71-8.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.4 10.59a7.02 7.02 0 010 2.82l-3.9 3.02C.54 14.82 0 13.48 0 12c0-1.48.54-2.82 1.5-4.43l3.9 3.02z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.15 0-5.7-1.82-6.6-4.55l-3.9 3.02C3.4 20.33 7.35 23 12 23z"
                  />
                </svg>
                Continue with Google
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Villex Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginFormInner />
    </React.Suspense>
  );
}
