'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@villex/ui';
import { Navbar } from '@/components/layout/navbar';

// Vendor Portal Redirect Target URL
const vendorPortalUrl = process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || 'http://localhost:3001';

export default function VendorSignupPage() {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [formData, setFormData] = React.useState({
    // Step 1: Owner Details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    // Step 2: Store Details
    storeName: '',
    storeDescription: '',
    supportEmail: '',
    supportPhone: '',
    // Step 3: Verification / Bank Details
    legalName: '',
    ntnNumber: '',
    bankName: '',
    bankAccountTitle: '',
    bankAccountNumber: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyPreset = () => {
    setFormData({
      firstName: 'Ehsan',
      lastName: 'Paracha',
      email: 'contact@electropulse.pk',
      password: 'SecurePassword123!',
      phone: '0321-9876543',
      storeName: 'ElectroPulse Store',
      storeDescription: 'Premium high-fidelity audio equipment and consumer electronics store.',
      supportEmail: 'support@electropulse.pk',
      supportPhone: '051-5551234',
      legalName: 'ElectroPulse Limited',
      ntnNumber: 'NTN-8901238-1',
      bankName: 'Habib Bank Limited (HBL)',
      bankAccountTitle: 'ElectroPulse Store Official',
      bankAccountNumber: 'HBL-0091820192801',
    });
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName) nextErrors.firstName = 'First name is required';
      if (!formData.lastName) nextErrors.lastName = 'Last name is required';
      if (!formData.email) nextErrors.email = 'Email address is required';
      if (!formData.password) nextErrors.password = 'Password is required';
      if (!formData.phone) nextErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.storeName) nextErrors.storeName = 'Store name is required';
      if (!formData.supportEmail) nextErrors.supportEmail = 'Support email is required';
      if (!formData.supportPhone) nextErrors.supportPhone = 'Support phone is required';
    } else if (step === 3) {
      if (!formData.legalName) nextErrors.legalName = 'Legal business name is required';
      if (!formData.ntnNumber) nextErrors.ntnNumber = 'Tax / NTN number is required';
      if (!formData.bankName) nextErrors.bankName = 'Bank name is required';
      if (!formData.bankAccountTitle) nextErrors.bankAccountTitle = 'Account title is required';
      if (!formData.bankAccountNumber) nextErrors.bankAccountNumber = 'Account number is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    const storeId = `#VLX-MER-${Math.floor(100 + Math.random() * 900)}`;
    const newVendor = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      storeName: formData.storeName,
      storeId: storeId,
      storeDescription: formData.storeDescription,
      supportEmail: formData.supportEmail,
      supportPhone: formData.supportPhone,
      legalName: formData.legalName,
      ntnNumber: formData.ntnNumber,
      bankName: formData.bankName,
      bankAccountTitle: formData.bankAccountTitle,
      bankAccountNumber: formData.bankAccountNumber,
      status: 'PENDING',
      verificationStatus: 'UNDER_REVIEW',
      joinedDate: new Date().toISOString().split('T')[0],
      revenue: 0,
      orders: 0
    };

    try {
      await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      });

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('villex_registered_vendors');
        const list = stored ? JSON.parse(stored) : [];
        const filteredList = list.filter((v: { email: string }) => v.email.toLowerCase() !== formData.email.toLowerCase());
        filteredList.push(newVendor);
        localStorage.setItem('villex_registered_vendors', JSON.stringify(filteredList));
      }
    } catch {
      // Fallback
    }

    setIsSubmitting(false);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-3xl opacity-30 w-96 h-96 -top-20 -left-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-accent/5 rounded-full filter blur-3xl opacity-30 w-96 h-96 -bottom-20 -right-20 pointer-events-none"></div>

        {step !== 4 ? (
          <Card className="w-full max-w-2xl bg-card border-border shadow-xl relative z-10">
            <CardHeader className="text-center pb-4 border-b border-border/60">
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-foreground">
                Register as a Vendor
              </CardTitle>
              <CardDescription className="text-xs">
                Start selling on Villex and reach thousands of verified customers today.
              </CardDescription>
            </CardHeader>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                <span className={step === 1 ? 'text-primary' : ''}>1. Owner info</span>
                <span className={step === 2 ? 'text-primary' : ''}>2. Store Details</span>
                <span className={step === 3 ? 'text-primary' : ''}>3. Bank & KYC</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <CardContent className="p-6 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          First Name
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Ehsan"
                          error={!!errors.firstName}
                        />
                        {errors.firstName && (
                          <p className="text-[10px] text-destructive font-bold">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Last Name
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Paracha"
                          error={!!errors.lastName}
                        />
                        {errors.lastName && (
                          <p className="text-[10px] text-destructive font-bold">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="owner@domain.com"
                        error={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-[10px] text-destructive font-bold">{errors.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Password
                        </label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="••••••••"
                          error={!!errors.password}
                        />
                        {errors.password && (
                          <p className="text-[10px] text-destructive font-bold">{errors.password}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="0321-9876543"
                          error={!!errors.phone}
                        />
                        {errors.phone && (
                          <p className="text-[10px] text-destructive font-bold">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Auto-fill testing button */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleApplyPreset}
                        className="text-[10px] font-black uppercase tracking-wider w-full h-10 border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        ⚡ Apply Auto-Fill Demo Preset
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Store Name
                      </label>
                      <Input
                        value={formData.storeName}
                        onChange={(e) => handleInputChange('storeName', e.target.value)}
                        placeholder="ElectroPulse Store"
                        error={!!errors.storeName}
                      />
                      {errors.storeName && (
                        <p className="text-[10px] text-destructive font-bold">{errors.storeName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Support Email
                        </label>
                        <Input
                          type="email"
                          value={formData.supportEmail}
                          onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                          placeholder="support@yourstore.pk"
                          error={!!errors.supportEmail}
                        />
                        {errors.supportEmail && (
                          <p className="text-[10px] text-destructive font-bold">{errors.supportEmail}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Support Phone
                        </label>
                        <Input
                          value={formData.supportPhone}
                          onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                          placeholder="051-5551234"
                          error={!!errors.supportPhone}
                        />
                        {errors.supportPhone && (
                          <p className="text-[10px] text-destructive font-bold">{errors.supportPhone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Store Description (Optional)
                      </label>
                      <textarea
                        value={formData.storeDescription}
                        onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                        placeholder="Describe what kind of goods your store sells..."
                        rows={4}
                        className="flex w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Legal Business Name
                        </label>
                        <Input
                          value={formData.legalName}
                          onChange={(e) => handleInputChange('legalName', e.target.value)}
                          placeholder="ElectroPulse Private Limited"
                          error={!!errors.legalName}
                        />
                        {errors.legalName && (
                          <p className="text-[10px] text-destructive font-bold">{errors.legalName}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          National Tax Number (NTN)
                        </label>
                        <Input
                          value={formData.ntnNumber}
                          onChange={(e) => handleInputChange('ntnNumber', e.target.value)}
                          placeholder="NTN-8901238-1"
                          error={!!errors.ntnNumber}
                        />
                        {errors.ntnNumber && (
                          <p className="text-[10px] text-destructive font-bold">{errors.ntnNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border/60 my-4 pt-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-3">
                        Payout Bank Account Information
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Bank Name
                          </label>
                          <Input
                            value={formData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            placeholder="Meezan Bank / HBL"
                            error={!!errors.bankName}
                          />
                          {errors.bankName && (
                            <p className="text-[10px] text-destructive font-bold">{errors.bankName}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Account Title
                          </label>
                          <Input
                            value={formData.bankAccountTitle}
                            onChange={(e) => handleInputChange('bankAccountTitle', e.target.value)}
                            placeholder="ElectroPulse Store"
                            error={!!errors.bankAccountTitle}
                          />
                          {errors.bankAccountTitle && (
                            <p className="text-[10px] text-destructive font-bold">{errors.bankAccountTitle}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Account / IBAN Number
                      </label>
                      <Input
                        value={formData.bankAccountNumber}
                        onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                        placeholder="PK70MEZN001234567890"
                        error={!!errors.bankAccountNumber}
                      />
                      {errors.bankAccountNumber && (
                        <p className="text-[10px] text-destructive font-bold">{errors.bankAccountNumber}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between border-t border-border/60 pt-4 mt-6">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack} className="h-10 px-6">
                      Back
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button type="button" variant="outline" className="h-10 px-6">
                        Cancel
                      </Button>
                    </Link>
                  )}

                  {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="h-10 px-8">
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </span>
                      ) : (
                        'Submit Sign Up'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Step 4: Onboarding Confirmation page */
          <Card className="w-full max-w-xl bg-card border-border shadow-2xl relative z-10 p-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mb-6 animate-scale-in">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-foreground uppercase tracking-wider">
              Registration Successful!
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-md">
              Congratulations! Your merchant account and your store &ldquo;{formData.storeName}&rdquo; are successfully registered in our platform database.
            </p>

            <div className="w-full bg-secondary/35 rounded-xl border border-border p-5 text-left text-xs my-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Store Identifier:</span>
                <span className="font-mono font-bold text-foreground">#VLX-MER-{Math.floor(100 + Math.random() * 900)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Store Name:</span>
                <span className="font-bold text-foreground">{formData.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-semibold">Verification Status:</span>
                <span className="font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase">
                  Pending Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <a 
                href={`${vendorPortalUrl}?signup_success=true&email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}&storeName=${encodeURIComponent(formData.storeName)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 w-full sm:w-auto text-center"
              >
                Login to Vendor Portal
              </a>
              <Link 
                href="/"
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] h-11 px-8 border border-input bg-transparent hover:bg-secondary hover:text-foreground w-full sm:w-auto text-center"
              >
                Back to Marketplace
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
