'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface Payout {
  id: string;
  storeName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountTitle?: string;
  requestedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  payoutMethod?: 'BANK' | 'JAZZCASH' | 'EASYPAISA';
}

interface PaymentsLedgerProps {
  payouts: Payout[];
  onApprovePayout: (id: string) => void;
  onDeclinePayout: (id: string) => void;
  onPayPayout?: (id: string) => void;
}

export function PaymentsLedger({ payouts, onApprovePayout, onDeclinePayout, onPayPayout }: PaymentsLedgerProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'>('ALL');

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      p.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.accountTitle && p.accountTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Payout['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Approved
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Paid
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            Escrow Payout Requests
          </CardTitle>
          <CardDescription className="text-xs">
            Review and settle bank transfer requests submitted by marketplace merchants.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search by store or ID..."
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
            {(['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                  statusFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'PENDING' ? 'Pending' : filter === 'APPROVED' ? 'Approved' : filter === 'PAID' ? 'Paid' : 'Rejected'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-6">Payout ID</th>
              <th className="py-3 px-6">Merchant Store</th>
              <th className="py-3 px-6 text-right">Settlement Amount</th>
              <th className="py-3 px-6">Channel & Account Details</th>
              <th className="py-3 px-6">Requested Date</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-bold">
                  No payout requests found.
                </td>
              </tr>
            ) : (
              filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-secondary/10 transition-colors duration-150">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {payout.id}
                  </td>
                  <td className="py-4 px-6 font-bold text-foreground">
                    {payout.storeName}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-foreground">
                    PKR {payout.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center font-bold text-foreground">
                      {payout.bankName === 'JazzCash' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-red-600/10 text-red-600 border border-red-600/20 mr-1.5 shrink-0 select-none">
                          JazzCash
                        </span>
                      )}
                      {payout.bankName === 'Easypaisa' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 mr-1.5 shrink-0 select-none">
                          Easypaisa
                        </span>
                      )}
                      {payout.bankName !== 'JazzCash' && payout.bankName !== 'Easypaisa' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-blue-600/10 text-blue-600 border border-blue-600/20 mr-1.5 shrink-0 select-none">
                          Bank
                        </span>
                      )}
                      <span className="truncate max-w-[150px]">{payout.bankName === 'JazzCash' || payout.bankName === 'Easypaisa' ? '' : payout.bankName}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 font-bold">{payout.accountNumber}</div>
                    {payout.accountTitle && (
                      <div className="text-[9px] text-muted-foreground/80 font-semibold mt-0.5">Title: {payout.accountTitle}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-muted-foreground">
                    {payout.requestedDate}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(payout.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {payout.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onApprovePayout(payout.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeclinePayout(payout.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {payout.status === 'APPROVED' && (
                        <>
                          {onPayPayout ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => onPayPayout(payout.id)}
                              className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                            >
                              Mark as Paid
                            </Button>
                          ) : (
                            <span className="text-[9px] font-bold text-muted-foreground/80 font-mono italic">
                              Approved
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeclinePayout(payout.id)}
                            className="text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {payout.status === 'PAID' && (
                        <span className="text-[9px] font-black text-emerald-500 font-mono uppercase tracking-wider">
                          ✓ Paid
                        </span>
                      )}
                      {payout.status === 'REJECTED' && (
                        <span className="text-[9px] font-black text-rose-500 font-mono uppercase tracking-wider">
                          ✗ Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
