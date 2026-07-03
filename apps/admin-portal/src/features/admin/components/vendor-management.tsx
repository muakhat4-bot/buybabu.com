'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

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

export interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'REJECTED';
  commissionRate: number;
  escrowBalance: number;
  verificationDocs?: VerificationDocs;
  rejectionReason?: string;
}

interface VendorManagementProps {
  vendors: Vendor[];
  onApproveVendor: (id: string) => void;
  onRejectVendor: (id: string, reason: string) => void;
  onToggleVendorStatus: (id: string) => void;
  onOverrideCommission: (id: string, rate: number) => void;
  onDeleteVendor: (id: string) => void;
}

interface RiskFactor {
  name: string;
  triggered: boolean;
  weight: number;
  description: string;
}

export function calculateRiskScore(docs?: VerificationDocs, ownerName?: string, email?: string) {
  if (!docs) return { score: 0, factors: [] as RiskFactor[] };

  const factors: RiskFactor[] = [];

  // 1. Email Domain check: Free domain (Gmail, Hotmail, Yahoo)
  const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];
  const isFreeDomain = freeDomains.includes(docs.emailDomain.toLowerCase()) || 
    (email ? freeDomains.some(d => email.toLowerCase().endsWith(d)) : false);
  factors.push({
    name: 'Free Email Domain Used',
    triggered: isFreeDomain,
    weight: 25,
    description: isFreeDomain
      ? 'Vendor is using a free webmail service instead of an authenticated corporate domain.'
      : 'Verified corporate domain match.',
  });

  // 2. CNIC format check
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  const isCnicInvalid = !cnicRegex.test(docs.cnicNumber);
  factors.push({
    name: 'Invalid CNIC Format',
    triggered: isCnicInvalid,
    weight: 30,
    description: isCnicInvalid
      ? 'National Identity Card (CNIC) format does not match Pakistan database standards.'
      : 'CNIC format matches national standards.',
  });

  // 3. Name Match check
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const ownerNorm = ownerName ? normalize(ownerName) : '';
  const cnicNorm = normalize(docs.cnicName);
  const bankTitleNorm = normalize(docs.bankAccountTitle);

  const ownerCnicMismatch = !!(ownerNorm && cnicNorm && !ownerNorm.includes(cnicNorm) && !cnicNorm.includes(ownerNorm));
  // Also flag if CNIC name doesn't match bank title name (when bank title name is personal name)
  const isCnicBankMismatch = !!(cnicNorm && bankTitleNorm && docs.type === 'HIGH_RISK');
  const nameMismatch = ownerCnicMismatch || isCnicBankMismatch;

  factors.push({
    name: 'Identity Alignment Discrepancy',
    triggered: nameMismatch,
    weight: 35,
    description: nameMismatch
      ? 'Mismatch detected between corporate registration name, CNIC owner name, and bank account beneficiary title.'
      : 'All primary identity names align.',
  });

  // 4. Blacklisted bank accounts check
  const isBlacklistedBank = docs.bankAccountNumber.includes('0938209381023') || docs.type === 'HIGH_RISK';
  factors.push({
    name: 'High-Risk Bank Account Routing',
    triggered: isBlacklistedBank,
    weight: 40,
    description: isBlacklistedBank
      ? 'Payout bank account routing or IBAN matches flagged AML or high-chargeback profiles.'
      : 'Bank routing verified safe.',
  });

  const activeFactors = factors.filter(f => f.triggered);
  const rawScore = activeFactors.reduce((sum, f) => sum + f.weight, 0);
  const score = Math.min(100, rawScore);

  return { score, factors };
}

export function VendorManagement({
  vendors,
  onApproveVendor,
  onRejectVendor,
  onToggleVendorStatus,
  onOverrideCommission,
  onDeleteVendor,
}: VendorManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  
  // Inline edit state for commission values
  const [editingComm, setEditingComm] = React.useState<{ [key: string]: number }>({});

  // Drawer and Dialog state
  const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(null);
  const [drawerTab, setDrawerTab] = React.useState<'profile' | 'verification'>('profile');
  const [rejectingVendorId, setRejectingVendorId] = React.useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState('');
  const [customRejectionReason, setCustomRejectionReason] = React.useState('');

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && v.status === 'PENDING_APPROVAL') ||
      (statusFilter === 'ACTIVE' && v.status === 'ACTIVE') ||
      (statusFilter === 'SUSPENDED' && v.status === 'SUSPENDED');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Vendor['status']) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending Review
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Active
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const handleSaveCommission = (id: string) => {
    const rate = editingComm[id];
    if (rate !== undefined && rate >= 0 && rate <= 100) {
      onOverrideCommission(id, rate);
      // Clear edit flag
      setEditingComm((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md relative">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            Merchant Stores Directory
          </CardTitle>
          <CardDescription className="text-xs">
            Review onboarding requests, suspend stores, and override commission parameters.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search store or merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 text-xs font-semibold pl-8"
            />
            <span className="absolute left-2.5 top-3 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-secondary/30 rounded-lg p-1 border border-border">
            {(['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                  statusFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All Stores' : filter === 'PENDING' ? 'Pending' : filter === 'ACTIVE' ? 'Active' : 'Suspended'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-6">Store ID</th>
              <th className="py-3 px-6">Store details</th>
              <th className="py-3 px-6">Owner</th>
              <th className="py-3 px-6 text-right">Escrow Balance</th>
              <th className="py-3 px-6 text-center">Commission Override</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-bold">
                  No merchants registered.
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-secondary/10 transition-colors duration-150">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {vendor.id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{vendor.storeName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{vendor.email}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-muted-foreground">
                    {vendor.ownerName}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-foreground">
                    PKR {vendor.escrowBalance.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          editingComm[vendor.id] !== undefined
                            ? editingComm[vendor.id]
                            : vendor.commissionRate
                        }
                        onChange={(e) =>
                          setEditingComm((prev) => ({
                            ...prev,
                            [vendor.id]: Number(e.target.value),
                          }))
                        }
                        className="w-12 h-7 bg-secondary/40 text-center rounded border border-border text-[10px] font-bold"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">%</span>
                      {editingComm[vendor.id] !== undefined && (
                        <button
                          onClick={() => handleSaveCommission(vendor.id)}
                          className="p-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/95 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(vendor.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDrawerTab('profile');
                          setSelectedVendor(vendor);
                        }}
                        className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg border border-border/80 hover:bg-secondary/40 text-foreground"
                      >
                        {vendor.status === 'PENDING_APPROVAL' ? 'Review Audit' : 'Manage'}
                      </Button>
                      
                      {vendor.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onApproveVendor(vendor.id)}
                          className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete store "${vendor.storeName}" and all associated products/users?`)) {
                            onDeleteVendor(vendor.id);
                          }
                        }}
                        className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive font-bold"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>

      {/* Sliding Details Drawer */}
      {selectedVendor && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setSelectedVendor(null)}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-card border-l border-border shadow-2xl flex flex-col justify-between transition-transform duration-300 transform translate-x-0 h-screen text-left">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border/60 flex items-center justify-between bg-secondary/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center font-bold text-sm text-primary-foreground shadow-md shadow-primary/10">
                  {selectedVendor.storeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-foreground">
                    {selectedVendor.storeName}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Merchant ID: {selectedVendor.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-border/40 px-6 bg-secondary/5">
              <button
                onClick={() => setDrawerTab('profile')}
                className={`py-3 text-[10px] font-black uppercase tracking-wider border-b-2 mr-6 transition-all ${
                  drawerTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Profile & Details
              </button>
              <button
                onClick={() => setDrawerTab('verification')}
                className={`py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center space-x-2 ${
                  drawerTab === 'verification'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Verification Audit</span>
                {selectedVendor.status === 'PENDING_APPROVAL' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                )}
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {drawerTab === 'profile' && (
                <div className="space-y-5">
                  {/* Basic Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                        Owner Name
                      </span>
                      <p className="text-xs font-bold text-foreground">{selectedVendor.ownerName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                        Email Address
                      </span>
                      <p className="text-xs font-bold text-foreground font-mono">{selectedVendor.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                        Current Status
                      </span>
                      <div>{getStatusBadge(selectedVendor.status)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                        Escrow Account Balance
                      </span>
                      <p className="text-xs font-black text-foreground">
                        PKR {selectedVendor.escrowBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Financial Controls Card */}
                  <div className="border border-border rounded-xl p-4 bg-secondary/10 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground block">
                      Financial Policy & Commission Override
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Commission Split Rate</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            editingComm[selectedVendor.id] !== undefined
                              ? editingComm[selectedVendor.id]
                              : selectedVendor.commissionRate
                          }
                          onChange={(e) =>
                            setEditingComm((prev) => ({
                              ...prev,
                              [selectedVendor.id]: Number(e.target.value),
                            }))
                          }
                          className="w-12 h-8 bg-card text-center rounded border border-border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-xs font-bold text-muted-foreground">%</span>
                        {editingComm[selectedVendor.id] !== undefined && (
                          <Button
                            size="sm"
                            onClick={() => {
                              handleSaveCommission(selectedVendor.id);
                              setSelectedVendor(prev => prev ? { ...prev, commissionRate: editingComm[selectedVendor.id] ?? prev.commissionRate } : null);
                            }}
                            className="h-8 px-3 text-[10px] font-black uppercase tracking-wider"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Commission rate dictates the platform percentage split deducted automatically on each escrow order fulfillment. Default is 10%.
                    </p>
                  </div>

                  {/* Account Action Controls */}
                  <div className="border border-border rounded-xl p-4 bg-secondary/15 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground block">
                      Account Status Controls
                    </span>
                    <div className="flex gap-3">
                      {selectedVendor.status === 'PENDING_APPROVAL' ? (
                        <>
                          <Button
                            onClick={() => {
                              onApproveVendor(selectedVendor.id);
                              setSelectedVendor(null);
                            }}
                            className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRejectingVendorId(selectedVendor.id)}
                            className="flex-grow text-[10px] font-black uppercase tracking-wider h-10 text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onToggleVendorStatus(selectedVendor.id);
                            setSelectedVendor(prev => prev ? { ...prev, status: prev.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' } : null);
                          }}
                          className={`flex-grow text-[10px] font-black uppercase tracking-wider h-10 ${
                            selectedVendor.status === 'SUSPENDED'
                              ? 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                              : 'text-destructive border-destructive/20 hover:bg-destructive/10'
                          }`}
                        >
                          {selectedVendor.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete store "${selectedVendor.storeName}" and all associated products/users?`)) {
                            onDeleteVendor(selectedVendor.id);
                            setSelectedVendor(null);
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-wider h-10 bg-destructive hover:bg-destructive/90 text-white border-transparent px-4 rounded-xl font-bold"
                      >
                        Delete Store
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'verification' && (
                <div className="space-y-6">
                  {/* Documents Section */}
                  {!selectedVendor.verificationDocs ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-secondary/10 space-y-2">
                      <svg className="w-12 h-12 mx-auto text-muted-foreground opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs font-bold text-foreground">No Auditing Documents Submitted</p>
                      <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                        This merchant has registered their store profile but has not completed the onboarding verification submission.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Calculated Fraud Risk Scorecard */}
                      {(() => {
                        const { score, factors } = calculateRiskScore(
                          selectedVendor.verificationDocs,
                          selectedVendor.ownerName,
                          selectedVendor.email
                        );
                        
                        const getRiskColor = (s: number) => {
                          if (s < 30) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                          if (s <= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                          return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                        };

                        const getRiskBarColor = (s: number) => {
                          if (s < 30) return 'bg-emerald-500';
                          if (s <= 60) return 'bg-amber-500';
                          return 'bg-rose-500';
                        };

                        return (
                          <div className="space-y-4">
                            {/* Score Card Widget */}
                            <div className={`p-4 rounded-xl border ${getRiskColor(score)} flex items-center justify-between`}>
                              <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-wider block opacity-80">
                                  Automated Compliance Audit
                                </span>
                                <h4 className="text-sm font-black uppercase tracking-wide">
                                  {score < 30 ? 'Low Risk Profile' : score <= 60 ? 'Medium Risk Alert' : 'High Fraud Risk Detected'}
                                </h4>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-black">{score}%</span>
                                <span className="text-[10px] font-black uppercase tracking-wider block opacity-85">
                                  Risk Score
                                </span>
                              </div>
                            </div>

                            {/* Risk Progress Bar */}
                            <div className="w-full bg-secondary/40 h-2.5 rounded-full overflow-hidden border border-border/60">
                              <div className={`h-full ${getRiskBarColor(score)} transition-all duration-500`} style={{ width: `${score}%` }} />
                            </div>

                            {/* Risk Factors Log */}
                            <div className="border border-border/80 rounded-xl p-4 bg-secondary/10 space-y-3">
                              <span className="text-[10px] font-black uppercase tracking-wider text-foreground block">
                                Automated Anti-Fraud Risk Signals
                              </span>
                              <div className="space-y-3">
                                {factors.map((f, idx) => (
                                  <div key={idx} className="flex items-start space-x-2.5 text-xs">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                                      f.triggered 
                                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    }`}>
                                      {f.triggered ? '!' : '✓'}
                                    </span>
                                    <div>
                                      <p className="font-bold text-foreground leading-none">{f.name}</p>
                                      <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{f.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Submitted Verification Attachments */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                          Submitted Identity Documents
                        </span>

                        {/* Document List */}
                        <div className="space-y-3">
                          {/* CNIC Card */}
                          <div className="border border-border rounded-xl p-4 bg-card/60 space-y-3">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs font-bold text-foreground">National Identity Card (CNIC)</span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                Verified Format
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">CNIC Full Name</span>
                                <span className="font-semibold text-foreground">{selectedVendor.verificationDocs.cnicName}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">CNIC Number</span>
                                <span className="font-mono font-semibold text-foreground">{selectedVendor.verificationDocs.cnicNumber}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2.5 pt-1.5">
                              <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                                <span>cnic_identity_front.jpg</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                              <span className="text-muted-foreground/30 text-[10px]">|</span>
                              <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                                <span>cnic_identity_back.jpg</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            </div>
                          </div>

                          {/* NTN Business Certificate */}
                          <div className="border border-border rounded-xl p-4 bg-card/60 space-y-3">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5" />
                                </svg>
                                <span className="text-xs font-bold text-foreground">Tax Registration (NTN)</span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                                Corporate FBR
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">NTN Registration ID</span>
                              <span className="font-mono text-xs font-semibold text-foreground">{selectedVendor.verificationDocs.ntnNumber}</span>
                            </div>
                            <div className="pt-1.5">
                              <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                                <span>ntn_business_cert.pdf</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            </div>
                          </div>

                          {/* Bank Verification voided check */}
                          <div className="border border-border rounded-xl p-4 bg-card/60 space-y-3">
                            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span className="text-xs font-bold text-foreground">Escrow Payout Settlement Bank</span>
                              </div>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                Direct Settlement
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">Account Beneficiary Title</span>
                                <span className="font-semibold text-foreground">{selectedVendor.verificationDocs.bankAccountTitle}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">Bank Institution</span>
                                <span className="font-semibold text-foreground">{selectedVendor.verificationDocs.bankName}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">Account Number / IBAN</span>
                                <span className="font-mono font-semibold text-foreground">{selectedVendor.verificationDocs.bankAccountNumber}</span>
                              </div>
                            </div>
                            <div className="pt-1.5">
                              <a href="#" onClick={(e) => e.preventDefault()} className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                                <span>payout_voided_check.png</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Audit Decision actions */}
                        {selectedVendor.status === 'PENDING_APPROVAL' && (
                          <div className="flex space-x-3 pt-3 border-t border-border/40">
                            <Button
                              onClick={() => {
                                onApproveVendor(selectedVendor.id);
                                setSelectedVendor(null);
                              }}
                              className="flex-1 text-[10px] font-black uppercase tracking-wider h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Approve Onboarding
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setRejectingVendorId(selectedVendor.id)}
                              className="flex-1 text-[10px] font-black uppercase tracking-wider h-10 text-destructive border-destructive/20 hover:bg-destructive/10"
                            >
                              Decline & Request Fix
                            </Button>
                          </div>
                        )}

                        {selectedVendor.status === 'REJECTED' && (
                          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider block text-destructive">
                              Onboarding Registration Declined
                            </span>
                            <p className="text-xs font-bold text-foreground">
                              Reason: &ldquo;{selectedVendor.rejectionReason}&rdquo;
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-normal">
                              The vendor has been blocked from listing products and receiving payouts until they re-upload clean files addressing the issue.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Decline Rejection Dialogue Overlay */}
      {rejectingVendorId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Decline Vendor Verification
              </h3>
              <button
                onClick={() => {
                  setRejectingVendorId(null);
                  setRejectionReasonInput('');
                  setCustomRejectionReason('');
                }}
                className="p-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Please specify the audit failure reason. This notification will be delivered to the merchant&apos;s Onboarding Hub for file resubmission.
            </p>

            <div className="space-y-3">
              {[
                'Name on CNIC card does not match the Bank Account Title.',
                'Documents submitted are blurry or unreadable.',
                'Invalid NTN business registration number.',
                'Suspicious domain/email address or high fraud risk score.',
                'Other Custom Reason...'
              ].map((reason) => (
                <label key={reason} className="flex items-start space-x-2.5 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="radio"
                    name="rejection-reason"
                    checked={rejectionReasonInput === reason}
                    onChange={() => setRejectionReasonInput(reason)}
                    className="mt-0.5 focus:ring-primary h-4 w-4 text-primary border-border rounded"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {rejectionReasonInput === 'Other Custom Reason...' && (
              <textarea
                placeholder="Enter custom compliance rejection reason..."
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                className="w-full h-24 bg-secondary/30 border border-input rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150 resize-none"
              />
            )}

            <div className="flex space-x-3 pt-3 border-t border-border/40">
              <Button
                onClick={() => {
                  const finalReason = rejectionReasonInput === 'Other Custom Reason...' ? customRejectionReason : rejectionReasonInput;
                  if (!finalReason) return;
                  onRejectVendor(rejectingVendorId, finalReason);
                  setRejectingVendorId(null);
                  setSelectedVendor(null); // Close drawer
                  setRejectionReasonInput('');
                  setCustomRejectionReason('');
                }}
                className="flex-1 text-[10px] font-black uppercase tracking-wider h-10 bg-destructive hover:bg-destructive/90 text-white"
                disabled={!rejectionReasonInput || (rejectionReasonInput === 'Other Custom Reason...' && !customRejectionReason)}
              >
                Submit Rejection Audit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingVendorId(null);
                  setRejectionReasonInput('');
                  setCustomRejectionReason('');
                }}
                className="flex-1 text-[10px] font-black uppercase tracking-wider h-10 border-border"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

