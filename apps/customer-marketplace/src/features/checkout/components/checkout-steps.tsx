'use client';

import * as React from 'react';
import { Card, Input } from '@villex/ui';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

interface CheckoutStepsProps {
  isGuest: boolean;
  email: string;
  setEmail: (val: string) => void;
  guestAddress: {
    name: string;
    street: string;
    city: string;
    zip: string;
    phone: string;
  };
  setGuestAddress: React.Dispatch<React.SetStateAction<{
    name: string;
    street: string;
    city: string;
    zip: string;
    phone: string;
  }>>;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  paymentMethod: 'card' | 'cod' | 'wallet';
  setPaymentMethod: (method: 'card' | 'cod' | 'wallet') => void;
  cardData: { number: string; expiry: string; cvc: string };
  setCardData: React.Dispatch<React.SetStateAction<{ number: string; expiry: string; cvc: string }>>;
  selectedWallet: 'jazzcash' | 'easypesa';
  setSelectedWallet: (wallet: 'jazzcash' | 'easypesa') => void;
  walletPhone: string;
  setWalletPhone: (val: string) => void;
  walletTid: string;
  setWalletTid: (val: string) => void;
}

export function CheckoutSteps({
  isGuest,
  email,
  setEmail,
  guestAddress,
  setGuestAddress,
  selectedAddressId,
  setSelectedAddressId,
  paymentMethod,
  setPaymentMethod,
  cardData,
  setCardData,
  selectedWallet,
  setSelectedWallet,
  walletPhone,
  setWalletPhone,
  walletTid,
  setWalletTid,
}: CheckoutStepsProps) {
  const savedAddresses: Address[] = [
    {
      id: 'addr-1',
      label: 'Home (Default)',
      name: 'Zayn Ali',
      street: 'House 412, Sector F-11',
      city: 'Islamabad',
      zip: '44000',
      country: 'Pakistan',
      phone: '+92 300 1234567',
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
    },
  ];

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const parts: string[] = [];
    for (let i = 0; i < value.length && i < 16; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardData(prev => ({ ...prev, number: parts.join(' ') }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      setCardData(prev => ({ ...prev, expiry: `${value.substring(0, 2)}/${value.substring(2)}` }));
    } else {
      setCardData(prev => ({ ...prev, expiry: value }));
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardData(prev => ({ ...prev, cvc: value.substring(0, 3) }));
  };

  const handleWalletPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setWalletPhone(value.substring(0, 11));
  };

  const handleWalletTidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setWalletTid(value.substring(0, 12));
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Onboarding / Account */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex items-center space-x-3 border-b border-border pb-3">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
            1
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Account Details</h3>
        </div>

        {isGuest ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                required
                placeholder="enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/20"
              />
            </div>
            <label className="flex items-center space-x-2.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-secondary/50" />
              <span>Create an account for faster checkout later</span>
            </label>
          </div>
        ) : (
          <div className="text-xs md:text-sm space-y-1 text-muted-foreground">
            <p>Logged in as: <strong className="text-foreground">Zayn Ali</strong></p>
            <p>Email: <span className="font-semibold text-foreground/80">zayn.ali@buybabu.com</span></p>
          </div>
        )}
      </Card>

      {/* Step 2: Shipping Destination */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex items-center space-x-3 border-b border-border pb-3">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
            2
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Shipping Address</h3>
        </div>

        {isGuest ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <Input
                required
                placeholder="Recipient Name"
                value={guestAddress.name}
                onChange={(e) => setGuestAddress({ ...guestAddress, name: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Street Address</label>
              <Input
                required
                placeholder="e.g. House 412, F-11"
                value={guestAddress.street}
                onChange={(e) => setGuestAddress({ ...guestAddress, street: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City</label>
                <Input
                  required
                  placeholder="e.g. Islamabad"
                  value={guestAddress.city}
                  onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Zip Code</label>
                <Input
                  required
                  placeholder="e.g. 44000"
                  value={guestAddress.zip}
                  onChange={(e) => setGuestAddress({ ...guestAddress, zip: e.target.value })}
                  className="bg-secondary/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <Input
                required
                placeholder="e.g. +92 300 1234567"
                value={guestAddress.phone}
                onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                className="bg-secondary/20"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/25'
                      : 'border-border bg-secondary/10 hover:border-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-foreground">{addr.label}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground"></div>}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-0.5 leading-snug">
                    <strong className="text-foreground block mb-1">{addr.name}</strong>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.zip}</p>
                    <p className="pt-1 text-foreground/80">{addr.phone}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Step 3: Payment Method Selection */}
      <Card className="p-5 border-border space-y-4">
        <div className="flex items-center space-x-3 border-b border-border pb-3">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
            3
          </div>
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Payment Method</h3>
        </div>

        {/* Tab row */}
        <div className="flex space-x-1.5 p-1 rounded-xl bg-secondary/35 border border-border">
          {(['card', 'cod', 'wallet'] as const).map((method) => {
            const isSelected = paymentMethod === method;
            const getLabel = () => {
              if (method === 'card') return 'Credit Card';
              if (method === 'cod') return 'Cash on Delivery';
              return 'Mobile Wallet';
            };
            return (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? 'bg-card text-foreground shadow border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {getLabel()}
              </button>
            );
          })}
        </div>

        {/* Dynamic Payment forms */}
        {paymentMethod === 'card' && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
              <Input
                placeholder="4242 •••• •••• 4242"
                value={cardData.number}
                onChange={handleCardNumberChange}
                className="bg-secondary/20"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</label>
                <Input
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={handleExpiryChange}
                  className="bg-secondary/20"
                  maxLength={5}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CVC / CVV</label>
                <Input
                  placeholder="123"
                  value={cardData.cvc}
                  onChange={handleCvcChange}
                  className="bg-secondary/20"
                  maxLength={3}
                  type="password"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/[0.02] text-xs leading-relaxed text-muted-foreground space-y-1 animate-fade-in">
            <strong className="text-foreground block">🤝 Buy Babu Open-Parcel Inspection</strong>
            <p>Pay cash to the courier rider upon parcel arrival. You have the right to open and inspect the package before completing payment.</p>
          </div>
        )}

        {paymentMethod === 'wallet' && (
          <div className="space-y-4 pt-2 animate-fade-in">
            {/* Wallet Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Select Mobile Wallet</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedWallet('jazzcash')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                    selectedWallet === 'jazzcash'
                      ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/25'
                      : 'border-border bg-secondary/10 hover:border-foreground/30'
                  }`}
                >
                  <span className="text-xl">⚡</span>
                  <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">JazzCash</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedWallet('easypesa')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${
                    selectedWallet === 'easypesa'
                      ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/25'
                      : 'border-border bg-secondary/10 hover:border-foreground/30'
                  }`}
                >
                  <span className="text-xl">💸</span>
                  <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">EasyPaisa</span>
                </button>
              </div>
            </div>

            {/* Account Info Details */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] text-xs leading-relaxed text-muted-foreground space-y-2">
              <strong className="text-foreground block uppercase tracking-wide">
                {selectedWallet === 'jazzcash' ? '📱 JazzCash Transfer Instructions' : '📱 EasyPaisa Transfer Instructions'}
              </strong>
              <p>
                Please transfer the total order amount from your mobile app to the following merchant mobile account:
              </p>
              <div className="bg-secondary/40 p-3 rounded-xl border border-border/60 space-y-1.5 font-mono text-xs text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Account Wallet:</span>
                  <span className="font-extrabold text-primary capitalize">{selectedWallet === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Mobile Number:</span>
                  <span className="font-black text-foreground text-sm select-all">03037434428</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold">Account Title:</span>
                  <span className="font-bold">Buy Babu Merchant</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Once payment is sent, fill in your phone number and the 12-digit Transaction ID (TID) received in the SMS receipt below.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Account Number (Phone)</label>
                <Input
                  placeholder="e.g. 03037434428"
                  value={walletPhone}
                  onChange={handleWalletPhoneChange}
                  className="bg-secondary/20"
                  maxLength={11}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaction ID (TID)</label>
                <Input
                  placeholder="e.g. 12-digit number"
                  value={walletTid}
                  onChange={handleWalletTidChange}
                  className="bg-secondary/20"
                  maxLength={12}
                  required
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
