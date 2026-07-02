'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from '@villex/ui';

export interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  walletBalance: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

interface CustomerManagementProps {
  customers: Customer[];
  onToggleCustomerStatus: (id: string) => void;
}

export function CustomerManagement({ customers, onToggleCustomerStatus }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
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
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/50 border-border backdrop-blur-md">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-lg font-black tracking-wider uppercase text-foreground">
            Customer Directory
          </CardTitle>
          <CardDescription className="text-xs">
            Review registered customer records, check transaction histories, and toggle suspended accounts.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs">
            <Input
              placeholder="Search customer name or email..."
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
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all duration-200 ${
                  statusFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All Customers' : filter === 'ACTIVE' ? 'Active' : 'Suspended'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-6">Customer ID</th>
              <th className="py-3 px-6">Customer details</th>
              <th className="py-3 px-6 text-center">Orders Count</th>
              <th className="py-3 px-6 text-right">Escrow Wallet Balance</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground font-bold">
                  No customers registered.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/10 transition-colors duration-150">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {customer.id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">{customer.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{customer.email}</div>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-foreground">
                    {customer.ordersCount}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-foreground">
                    PKR {customer.walletBalance.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleCustomerStatus(customer.id)}
                      className={`text-[9px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg ${
                        customer.status === 'SUSPENDED'
                          ? 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                          : 'text-destructive border-destructive/20 hover:bg-destructive/10'
                      }`}
                    >
                      {customer.status === 'SUSPENDED' ? 'Re-Activate' : 'Suspend Account'}
                    </Button>
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
