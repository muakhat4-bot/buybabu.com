'use client';

import * as React from 'react';
import { Button, Card } from '@villex/ui';

interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard';
  last4: string;
  expiry: string;
  cardholderName: string;
  isDefault: boolean;
}

interface SavedWallet {
  id: string;
  provider: 'easypaisa' | 'jazzcash';
  accountTitle: string;
  accountNumber: string;
  isDefault: boolean;
}

export function PaymentMethodsPanel() {
  const [cards, setCards] = React.useState<SavedCard[]>([
    {
      id: 'card-1',
      brand: 'visa',
      last4: '4242',
      expiry: '12/28',
      cardholderName: 'Zayn Ali',
      isDefault: true
    },
    {
      id: 'card-2',
      brand: 'mastercard',
      last4: '8812',
      expiry: '06/27',
      cardholderName: 'Zayn Ali',
      isDefault: false
    }
  ]);

  const [wallets, setWallets] = React.useState<SavedWallet[]>([
    {
      id: 'wallet-1',
      provider: 'easypaisa',
      accountTitle: 'Zayn Ali',
      accountNumber: '0300****567',
      isDefault: false
    }
  ]);

  const handleSetDefaultCard = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleSetDefaultWallet = (id: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, isDefault: w.id === id })));
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Saved Payment Methods</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your credit/debit cards and mobile wallet accounts for a faster checkout experience.</p>
      </div>

      {/* Credit Cards Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Credit / Debit Cards</h3>
            <p className="text-xs text-muted-foreground">Securely saved Visa and Mastercard methods.</p>
          </div>
          <Button variant="outline" size="sm">
            + Add New Card
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-44 ${
                card.isDefault
                  ? 'bg-gradient-to-br from-secondary/80 to-card border-primary/50 shadow-md'
                  : 'bg-card/45 border-border hover:border-muted-foreground/30'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="uppercase tracking-wider font-extrabold text-sm text-foreground">
                    {card.brand === 'visa' ? 'Visa Card' : 'Mastercard'}
                  </div>
                  {card.isDefault && (
                    <span className="text-[9px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>
                <div className="font-mono text-lg font-semibold tracking-widest mt-4">
                  •••• •••• •••• {card.last4}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cardholder</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">{card.cardholderName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Expires</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">{card.expiry}</div>
                  </div>
                </div>

                <div className="border-t border-border mt-3 pt-3 flex justify-end space-x-2 text-xs">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefaultCard(card.id)}
                      className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider"
                    >
                      Make Default
                    </button>
                  )}
                  {!card.isDefault && <span className="text-border">|</span>}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-destructive hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
              No saved credit or debit cards.
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Wallets Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <h3 className="font-bold text-lg">Mobile Wallets</h3>
            <p className="text-xs text-muted-foreground">Easypaisa and JazzCash account integrations.</p>
          </div>
          <Button variant="outline" size="sm">
            + Add Wallet
          </Button>
        </div>

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                wallet.isDefault ? 'bg-secondary/40 border-primary/30' : 'bg-card/25 border-border'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  {wallet.provider.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground capitalize">{wallet.provider} Wallet</span>
                    {wallet.isDefault && (
                      <span className="text-[8px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Account Title: {wallet.accountTitle} | Number: {wallet.accountNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                {!wallet.isDefault && (
                  <button
                    onClick={() => handleSetDefaultWallet(wallet.id)}
                    className="text-primary hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    Set Default
                  </button>
                )}
                {!wallet.isDefault && <span className="text-border">|</span>}
                <button
                  onClick={() => handleDeleteWallet(wallet.id)}
                  className="text-destructive hover:underline font-bold text-[10px] uppercase tracking-wider"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {wallets.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No integrated mobile wallet accounts.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
