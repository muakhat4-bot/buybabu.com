'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface WalletTransaction {
  id: string;
  type: 'SALE' | 'REFUND' | 'COMMISSION' | 'WITHDRAWAL';
  amount: number;
  orderId?: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'PAID';
  details: string;
}

export interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  lifetimeSales: number;
  lifetimeCommission: number;
  transactions: WalletTransaction[];
}

interface WalletPanelProps {
  wallet?: WalletData;
  vendorEmail: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  onRefreshWallet: () => void;
}

export function WalletPanel({
  wallet = { availableBalance: 0, pendingBalance: 0, lifetimeSales: 0, lifetimeCommission: 0, transactions: [] },
  vendorEmail,
  bankName,
  bankAccountTitle,
  bankAccountNumber,
  onRefreshWallet
}: WalletPanelProps) {
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const [payoutMethod, setPayoutMethod] = React.useState<'BANK' | 'JAZZCASH' | 'EASYPAISA'>('BANK');
  const [inputBankName, setInputBankName] = React.useState(bankName || '');
  const [inputAccountTitle, setInputAccountTitle] = React.useState(bankAccountTitle || '');
  const [inputAccountNumber, setInputAccountNumber] = React.useState(bankAccountNumber || '');
  const [mobileWalletTitle, setMobileWalletTitle] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');

  React.useEffect(() => {
    setInputBankName(bankName || '');
    setInputAccountTitle(bankAccountTitle || '');
    setInputAccountNumber(bankAccountNumber || '');
  }, [bankName, bankAccountTitle, bankAccountNumber]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'ALL' | 'SALE' | 'COMMISSION' | 'REFUND' | 'WITHDRAWAL'>('ALL');

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (amountNum > wallet.availableBalance) {
      setErrorMsg('Insufficient available balance to complete this withdrawal request.');
      return;
    }

    const payoutDetails = payoutMethod === 'BANK' ? {
      bankName: inputBankName,
      accountTitle: inputAccountTitle,
      accountNumber: inputAccountNumber,
    } : {
      accountTitle: mobileWalletTitle,
      mobileNumber: mobileNumber,
    };

    if (payoutMethod === 'BANK') {
      if (!inputBankName || !inputAccountTitle || !inputAccountNumber) {
        setErrorMsg('Please fill in all bank details.');
        return;
      }
    } else {
      if (!mobileWalletTitle || !mobileNumber) {
        setErrorMsg(`Please fill in all ${payoutMethod === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'} details.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_withdrawal',
          email: vendorEmail,
          amount: amountNum,
          payoutMethod,
          payoutDetails,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMsg(`Withdrawal request of PKR ${amountNum.toLocaleString()} submitted successfully via ${payoutMethod === 'BANK' ? 'Bank Transfer' : payoutMethod === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'}!`);
        setWithdrawAmount('');
        if (payoutMethod !== 'BANK') {
          setMobileWalletTitle('');
          setMobileNumber('');
        }
        onRefreshWallet();
      } else {
        setErrorMsg(result.error || 'Failed to submit withdrawal request.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = (wallet.transactions || []).filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.orderId && tx.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTxBadge = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'SALE':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Sale
          </span>
        );
      case 'COMMISSION':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Commission (10%)
          </span>
        );
      case 'REFUND':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Refund
          </span>
        );
      case 'WITHDRAWAL':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Withdrawal
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: WalletTransaction['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Approved
          </span>
        );
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Paid
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-xl font-black tracking-wider uppercase text-foreground">
          My Store Wallet
        </h2>
        <p className="text-xs text-muted-foreground">
          Monitor your earnings, platform service fees, refunds, and request bank payouts.
        </p>
      </div>

      {/* Balances Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Available Balance */}
        <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Available Balance
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                  PKR {wallet.availableBalance.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-semibold">
              Settled net earnings ready for payout.
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pending Balance */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending Balance
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                  PKR {wallet.pendingBalance.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-semibold">
              Locked in escrow, released on delivery.
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Lifetime Sales */}
        <Card className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/15 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Lifetime Sales
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                  PKR {wallet.lifetimeSales.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-semibold">
              Total gross revenue generated.
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Lifetime Commission */}
        <Card className="bg-gradient-to-br from-rose-500/5 to-pink-500/5 border-rose-500/15 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Platform service fee (10%)
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                  PKR {wallet.lifetimeCommission.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-semibold">
              Total service charges paid to Buy Babu.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Left Side: Ledger History Table */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-sm font-black tracking-wider uppercase text-foreground">
                  Transaction Ledger History
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Real-time ledger audit log of all sales, refunds, commissions, and payouts.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row gap-3 px-6 mb-4">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Search by ID or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs font-semibold pl-8 h-9"
                  />
                  <span className="absolute left-2.5 top-2.5 text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-secondary/30 rounded-lg p-1 border border-border shrink-0 self-start">
                  {(['ALL', 'SALE', 'COMMISSION', 'REFUND', 'WITHDRAWAL'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTypeFilter(filter)}
                      className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all duration-200 ${
                        typeFilter === filter
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filter === 'ALL' ? 'All' : filter === 'SALE' ? 'Sales' : filter === 'COMMISSION' ? 'Fee' : filter === 'REFUND' ? 'Refunds' : 'Payouts'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border/40 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                      <th className="py-2.5 px-6">Date</th>
                      <th className="py-2.5 px-4">Transaction ID</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Details</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-[11px]">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-muted-foreground font-bold font-mono">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isIncome = tx.type === 'SALE';
                        return (
                          <tr key={tx.id} className="hover:bg-secondary/10 transition-colors duration-150">
                            <td className="py-3 px-6 text-muted-foreground font-semibold">
                              {tx.date}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-foreground">
                              {tx.id.slice(0, 16)}
                            </td>
                            <td className="py-3 px-4">
                              {getTxBadge(tx.type)}
                            </td>
                            <td className="py-3 px-4 font-medium text-muted-foreground max-w-[150px] truncate" title={tx.details}>
                              {tx.details}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(tx.status)}
                            </td>
                            <td className={`py-3 px-6 text-right font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isIncome ? '+' : '-' } PKR {tx.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Withdrawal Request Card */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/50 border-border backdrop-blur-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-black tracking-wider uppercase text-foreground">
                Request Payout Settlement
              </CardTitle>
              <CardDescription className="text-[11px]">
                Submit a withdrawal request to transfer settled funds.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Channel Selector */}
              <div className="mb-5 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Select Payout Channel
                </label>
                <div className="grid grid-cols-3 gap-2 bg-secondary/30 rounded-lg p-1 border border-border">
                  {(['BANK', 'JAZZCASH', 'EASYPAISA'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPayoutMethod(method)}
                      className={`py-2 px-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                        payoutMethod === method
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      {method === 'BANK' ? 'Bank' : method === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Input Details */}
              {payoutMethod === 'BANK' && (
                <div className="rounded-xl bg-secondary/30 border border-border p-4 mb-5 space-y-3 text-[11px]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                    Bank Account Details
                  </span>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block">Bank Name</label>
                    <Input
                      placeholder="e.g. HBL, Meezan Bank"
                      value={inputBankName}
                      onChange={(e) => setInputBankName(e.target.value)}
                      className="w-full text-xs font-semibold h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block">Account Title</label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={inputAccountTitle}
                      onChange={(e) => setInputAccountTitle(e.target.value)}
                      className="w-full text-xs font-semibold h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block">Account Number / IBAN</label>
                    <Input
                      placeholder="e.g. PK70MEZN000102..."
                      value={inputAccountNumber}
                      onChange={(e) => setInputAccountNumber(e.target.value)}
                      className="w-full text-xs font-semibold h-9"
                    />
                  </div>
                </div>
              )}

              {(payoutMethod === 'JAZZCASH' || payoutMethod === 'EASYPAISA') && (
                <div className="rounded-xl bg-secondary/30 border border-border p-4 mb-5 space-y-3 text-[11px]">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                    {payoutMethod === 'JAZZCASH' ? 'JazzCash Account' : 'Easypaisa Account'}
                  </span>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block">Account Holder Name</label>
                    <Input
                      placeholder="e.g. Zahid Mushtaq"
                      value={mobileWalletTitle}
                      onChange={(e) => setMobileWalletTitle(e.target.value)}
                      className="w-full text-xs font-semibold h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-muted-foreground block">Mobile Account Number</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 03029808684"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full text-xs font-semibold h-9"
                    />
                  </div>
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Withdrawal Amount (PKR)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full text-xs font-semibold pl-12 h-10"
                      disabled={loading || wallet.availableBalance <= 0}
                    />
                    <span className="absolute left-3.5 top-3.5 text-xs text-muted-foreground font-black">
                      PKR
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    ✅ {successMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs font-black uppercase tracking-wider h-10 rounded-xl"
                  disabled={loading || wallet.availableBalance <= 0 || !withdrawAmount}
                >
                  {loading ? 'Processing request...' : 'Initiate Withdrawal'}
                </Button>
              </form>

              {wallet.availableBalance <= 0 && (
                <p className="text-[10px] text-rose-400 font-semibold mt-3 text-center">
                  ⚠️ Payouts disabled: your available balance is PKR 0.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
