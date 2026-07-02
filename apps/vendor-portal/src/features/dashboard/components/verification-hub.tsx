'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@villex/ui';

export interface VerificationDocs {
  cnicName: string;
  cnicNumber: string;
  ntnNumber: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankName: string;
  emailDomain: string;
  type: 'VALID' | 'HIGH_RISK';
}

interface VerificationHubProps {
  status: 'NOT_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  onSubmit: (docs: VerificationDocs) => void;
  onReset: () => void;
  storeName?: string;
  ownerName?: string;
  email?: string;
}

export function VerificationHub({ status, rejectionReason, onSubmit, onReset, storeName, ownerName, email }: VerificationHubProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<'VALID' | 'HIGH_RISK' | null>(null);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);

  const handleApplyPreset = (type: 'VALID' | 'HIGH_RISK') => {
    setSelectedPreset(type);
    setUploadedFiles(['cnic_identity_front.jpg', 'cnic_identity_back.jpg', 'ntn_business_cert.pdf', 'payout_voided_check.png']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreset) return;

    // Construct mock audit documents using real merchant data if available
    const docs: VerificationDocs = selectedPreset === 'VALID' ? {
      cnicName: ownerName || 'Ehsan Paracha',
      cnicNumber: '37405-1234567-1',
      ntnNumber: 'NTN-8901238-1',
      bankAccountTitle: storeName || 'ElectroPulse Store',
      bankAccountNumber: 'HBL-0091820192801',
      bankName: 'Habib Bank Limited (HBL)',
      emailDomain: email ? email.split('@')[1] || 'electropulse.pk' : 'electropulse.pk',
      type: 'VALID',
    } : {
      cnicName: 'Fake Name Mismatch',
      cnicNumber: '99999-9999999-9',
      ntnNumber: 'NTN-9999999-9',
      bankAccountTitle: 'John Doe Personal Account',
      bankAccountNumber: 'ALFH-0938209381023',
      bankName: 'Bank Alfalah',
      emailDomain: 'anonymous-gmail-domain.com',
      type: 'HIGH_RISK',
    };

    onSubmit(docs);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-wider uppercase text-foreground">
          Vendor Verification Hub
        </h2>
        <p className="text-xs text-muted-foreground">
          Complete verification audits to secure customer trust and unlock payout bank transfers.
        </p>
      </div>

      {/* Status Banners */}
      {status === 'UNDER_REVIEW' && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs leading-normal">
            <p className="font-black uppercase tracking-wider text-[10px]">Verification Under Review</p>
            <p className="mt-1 font-semibold text-muted-foreground">
              Documents submitted successfully! Our trust and compliance team is auditing your details. Payout features will activate upon approval.
            </p>
          </div>
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs leading-normal">
            <p className="font-black uppercase tracking-wider text-[10px] text-emerald-500">Verification Approved</p>
            <p className="mt-1 font-semibold text-muted-foreground">
              Congratulations! Your merchant profile is fully verified. Escrow bank payout settlements are unlocked.
            </p>
          </div>
        </div>
      )}

      {status === 'REJECTED' && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs leading-normal">
            <p className="font-black uppercase tracking-wider text-[10px] text-destructive">Verification Declined</p>
            <p className="mt-1 font-semibold text-muted-foreground">
              Audit failed. Reason: <span className="font-bold text-destructive">&ldquo;{rejectionReason}&rdquo;</span>. Please review policies and resubmit verification files below.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              className="mt-3 text-[9px] font-black uppercase tracking-wider border-destructive/20 text-destructive hover:bg-destructive/10 h-7 rounded-lg"
            >
              Re-Upload Documents
            </Button>
          </div>
        </div>
      )}

      {/* Core Uploader Card */}
      {status === 'NOT_SUBMITTED' && (
        <Card className="bg-card/50 border-border backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground">
              Onboarding Audit Documents
            </CardTitle>
            <CardDescription className="text-[11px]">
              Select presets or customize documents to test the verification pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-6">
            {/* Presets */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Verification Testing Presets
              </span>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => handleApplyPreset('VALID')}
                  className={`text-[10px] font-black uppercase tracking-wider h-10 px-4 rounded-xl flex-grow ${
                    selectedPreset === 'VALID'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-secondary/40 text-foreground border border-border'
                  }`}
                >
                  Apply Low-Risk Preset (Valid ID & Bank)
                </Button>
                <Button
                  type="button"
                  onClick={() => handleApplyPreset('HIGH_RISK')}
                  className={`text-[10px] font-black uppercase tracking-wider h-10 px-4 rounded-xl flex-grow ${
                    selectedPreset === 'HIGH_RISK'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-secondary/40 text-foreground border border-border'
                  }`}
                >
                  Apply High-Risk Preset (Mismatched Info)
                </Button>
              </div>
            </div>

            {/* Uploaded File List preview */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Verification Package Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="border border-border/60 bg-secondary/15 p-3 rounded-xl flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center space-x-2.5">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-mono text-[10px]">{file}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">
                        ✓ Loaded
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmit}
                    className="text-[10px] font-black uppercase tracking-wider h-10 px-6 rounded-xl"
                  >
                    Submit Verification package
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification Stepper Timeline (Visible once submitted) */}
      {status !== 'NOT_SUBMITTED' && (
        <Card className="bg-card/20 border-border/60">
          <CardContent className="p-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-4">
              Audit Progress Stepper
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px] leading-normal select-none">
              <div className="flex items-center space-x-2.5 text-primary">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>Docs Submitted</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${status !== 'REJECTED' && 'text-primary'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${status === 'APPROVED' ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>
                  {status === 'APPROVED' ? '✓' : '2'}
                </span>
                <span>Identity Check</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${status === 'APPROVED' && 'text-primary'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${status === 'APPROVED' ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>
                  {status === 'APPROVED' ? '✓' : '3'}
                </span>
                <span>Bank Matching</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${status === 'APPROVED' && 'text-primary animate-pulse'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${status === 'APPROVED' ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>
                  {status === 'APPROVED' ? '✓' : '4'}
                </span>
                <span>Activation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
