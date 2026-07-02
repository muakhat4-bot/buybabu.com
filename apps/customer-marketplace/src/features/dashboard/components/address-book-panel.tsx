'use client';

import * as React from 'react';
import { Button, Card, Input } from '@villex/ui';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export function AddressBookPanel() {
  const [addresses, setAddresses] = React.useState<Address[]>([
    {
      id: 'addr-1',
      label: 'Home',
      name: 'Zayn Ali',
      street: 'House 412, Sector F-11',
      city: 'Islamabad',
      zip: '44000',
      country: 'Pakistan',
      phone: '+92 300 1234567',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    {
      id: 'addr-2',
      label: 'Office',
      name: 'Zayn Ali',
      street: 'TechHub Space, 3rd Floor, Plaza 9',
      city: 'Islamabad',
      zip: '44000',
      country: 'Pakistan',
      phone: '+92 300 7654321',
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);

  // Form State
  const [form, setForm] = React.useState({
    label: '',
    name: '',
    street: '',
    city: '',
    zip: '',
    country: 'Pakistan',
    phone: '',
    isDefaultShipping: false,
    isDefaultBilling: false,
  });

  React.useEffect(() => {
    if (editingAddress) {
      setForm({ ...editingAddress });
    } else {
      setForm({
        label: '',
        name: '',
        street: '',
        city: '',
        zip: '',
        country: 'Pakistan',
        phone: '',
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
    }
  }, [editingAddress, isModalOpen]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const handleSetDefaultShipping = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefaultShipping: addr.id === id,
      }))
    );
  };

  const handleSetDefaultBilling = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefaultBilling: addr.id === id,
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      // Edit mode
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === editingAddress.id ? { ...addr, ...form } : addr))
      );
      // Clean defaults if this one was set as default
      if (form.isDefaultShipping) {
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefaultShipping: addr.id === editingAddress.id ? true : false })));
      }
      if (form.isDefaultBilling) {
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefaultBilling: addr.id === editingAddress.id ? true : false })));
      }
    } else {
      // Add mode
      const newId = `addr-${Date.now()}`;
      const newAddress: Address = {
        id: newId,
        ...form,
      };

      setAddresses((prev) => [...prev, newAddress]);

      if (form.isDefaultShipping) {
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefaultShipping: addr.id === newId ? true : false })));
      }
      if (form.isDefaultBilling) {
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefaultBilling: addr.id === newId ? true : false })));
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Address Book</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your primary shipping and billing locations for faster checkout experiences.</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="font-semibold gap-1.5 flex items-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Address
        </Button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <Card key={addr.id} className="p-6 border-border flex flex-col relative group">
            {/* Header / Labels */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-bold text-base text-foreground">{addr.label}</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {addr.isDefaultShipping && (
                    <span className="text-[9px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Default Shipping
                    </span>
                  )}
                  {addr.isDefaultBilling && (
                    <span className="text-[9px] bg-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Default Billing
                    </span>
                  )}
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                  title="Edit Address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  title="Delete Address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Address Details */}
            <div className="text-sm space-y-1 text-muted-foreground flex-grow">
              <strong className="text-foreground text-sm block mb-1.5">{addr.name}</strong>
              <p className="leading-relaxed">{addr.street}</p>
              <p>{addr.city}, {addr.zip}</p>
              <p>{addr.country}</p>
              <p className="pt-2 text-xs flex items-center gap-1.5 text-foreground/80">
                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {addr.phone}
              </p>
            </div>

            {/* Set Default Actions */}
            <div className="border-t border-border mt-4 pt-3 flex gap-4 text-xs font-semibold">
              {!addr.isDefaultShipping && (
                <button
                  onClick={() => handleSetDefaultShipping(addr.id)}
                  className="text-primary hover:underline"
                >
                  Set Default Shipping
                </button>
              )}
              {!addr.isDefaultBilling && (
                <button
                  onClick={() => handleSetDefaultBilling(addr.id)}
                  className="text-violet-400 hover:underline"
                >
                  Set Default Billing
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Address modal popover */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg bg-card border-border shadow-2xl relative flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="border-b border-border pb-4 mb-5">
              <h3 className="text-lg font-bold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <p className="text-xs text-muted-foreground">Fill in shipping and billing details.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Address Tag Label</label>
                  <Input
                    required
                    placeholder="e.g. Home, Office, Beach House"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recipient Name</label>
                  <Input
                    required
                    placeholder="e.g. Zayn Ali"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Street Address</label>
                <Input
                  required
                  placeholder="e.g. House 123, Street 45, Sector F-11"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City</label>
                  <Input
                    required
                    placeholder="e.g. Islamabad"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Zip Code</label>
                  <Input
                    required
                    placeholder="e.g. 44000"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Country</label>
                  <Input
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <Input
                    required
                    placeholder="e.g. +92 300 1234567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isDefaultShipping}
                    onChange={(e) => setForm({ ...form, isDefaultShipping: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50"
                  />
                  <span>Set as default shipping location</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isDefaultBilling}
                    onChange={(e) => setForm({ ...form, isDefaultBilling: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50"
                  />
                  <span>Set as default billing location</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingAddress ? 'Save Changes' : 'Add Location'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
