'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Button, Card } from '@villex/ui';
import { CheckoutSteps } from '@/features/checkout/components/checkout-steps';
import { CheckoutSummary } from '@/features/checkout/components/checkout-summary';
import { useCart } from '@/features/checkout/context/cart-context';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const [isGuest, setIsGuest] = React.useState(false); // Mode switch: Logged-in vs Guest
  
  // Form states
  const [email, setEmail] = React.useState('');
  const [guestAddress, setGuestAddress] = React.useState({
    name: '',
    street: '',
    city: '',
    zip: '',
    phone: '',
  });
  
  const [selectedAddressId, setSelectedAddressId] = React.useState('addr-1');
  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'cod' | 'wallet'>('card');
  const [cardData, setCardData] = React.useState({ number: '', expiry: '', cvc: '' });

  // Wallet states
  const [selectedWallet, setSelectedWallet] = React.useState<'jazzcash' | 'easypesa'>('jazzcash');
  const [walletPhone, setWalletPhone] = React.useState('');
  const [walletTid, setWalletTid] = React.useState('');

  // Processing & Confirmation States
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [orderId, setOrderId] = React.useState('');
  const [confirmedTotal, setConfirmedTotal] = React.useState(0);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = React.useState('');
  const [confirmedWallet, setConfirmedWallet] = React.useState<'jazzcash' | 'easypesa' | null>(null);
  const [confirmedWalletTid, setConfirmedWalletTid] = React.useState('');

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const checkoutItems = cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    brand: item.brand || 'ElectroPulse',
  }));

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountPercent = 0; // Do not include any coupon discount
  const shippingFee = 250; // Flat delivery charges 250 PKR

  const finalTotal = subtotal + shippingFee;

  const validateForm = () => {
    if (isGuest) {
      if (!email.trim() || !email.includes('@')) {
        return 'Please enter a valid email address.';
      }
      if (!guestAddress.name.trim()) return 'Please enter recipient name.';
      if (!guestAddress.street.trim()) return 'Please enter street address.';
      if (!guestAddress.city.trim()) return 'Please enter city.';
      if (!guestAddress.zip.trim()) return 'Please enter zip code.';
      if (!guestAddress.phone.trim()) return 'Please enter contact phone number.';
    }

    if (paymentMethod === 'card') {
      const cleanNum = cardData.number.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        return 'Please enter your complete 16-digit credit card number.';
      }
      if (cardData.expiry.length < 5 || !cardData.expiry.includes('/')) {
        return 'Please enter your card expiration date in MM/YY format.';
      }
      if (cardData.cvc.length < 3) {
        return 'Please enter the 3-digit CVV/CVC security code on the back of your card.';
      }
    }

    if (paymentMethod === 'wallet') {
      const cleanPhone = walletPhone.replace(/\s/g, '');
      if (cleanPhone.length < 11 || !cleanPhone.startsWith('03')) {
        return 'Please enter a valid 11-digit mobile wallet account number starting with 03 (e.g., 03037434428).';
      }
      const cleanTid = walletTid.replace(/\s/g, '');
      if (cleanTid.length < 12) {
        return 'Please enter the 12-digit transaction ID (TID) from your JazzCash/EasyPaisa receipt SMS.';
      }
    }

    return null;
  };

  const handlePlaceOrder = async () => {
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      setToastMessage(error);
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    const generatedId = `VLX-${Math.floor(100000 + Math.random() * 900000)}-${paymentMethod.toUpperCase()}`;
    const customerName = isGuest ? guestAddress.name : 'Zayn Ali';
    const customerPhone = isGuest ? guestAddress.phone : '+92 300 1234567';
    const shippingAddress = isGuest
      ? `${guestAddress.street}, ${guestAddress.city}, ${guestAddress.zip}`
      : 'House 412, Sector F-11, Islamabad';

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

    const mappedPaymentMethod = paymentMethod === 'wallet'
      ? (selectedWallet === 'jazzcash' ? 'JazzCash' : 'EasyPaisa')
      : paymentMethod === 'card' ? 'Card' : 'COD';

    // Status: Mobile wallet starts as PENDING. COD/Card start as PROCESSING
    const initialStatus = paymentMethod === 'wallet' ? 'PENDING' : 'PROCESSING';

    const orderPayload = {
      id: generatedId,
      customerName,
      customerPhone,
      shippingAddress,
      date: dateStr,
      total: finalTotal,
      paymentMethod: mappedPaymentMethod,
      status: initialStatus,
      itemsCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image,
        spec: item.brand || 'ElectroPulse'
      })),
      ...(paymentMethod === 'wallet' ? { walletPhone, walletTid } : {})
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to save order to database.');
      }

      setOrderId(generatedId);
      setConfirmedTotal(finalTotal);
      setConfirmedPaymentMethod(paymentMethod);
      if (paymentMethod === 'wallet') {
        setConfirmedWallet(selectedWallet);
        setConfirmedWalletTid(walletTid);
      }
      setConfirmed(true);
      clearCart();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Checkout Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      {/* Navbar header */}
      <Navbar />

      {/* Toast validation notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl bg-destructive text-destructive-foreground shadow-2xl border border-destructive/20 flex items-center gap-2.5 animate-slide-up text-sm font-semibold max-w-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {confirmed ? (
        /* Order Confirmation Success Screen */
        <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center animate-fade-in max-w-xl">
          {/* Centered opaque Card wrapper */}
          <Card className="p-8 border-border bg-card shadow-2xl w-full flex flex-col items-center space-y-6">
            {/* Green Checkmark Circle */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-scale-in">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {confirmedPaymentMethod === 'wallet' ? (
                  <>
                    Thank you Zayn! Your order has been placed. Your payment is currently <strong className="text-amber-500 font-extrabold uppercase">Pending Verification</strong>. The vendor will confirm the receipt of the amount and approve the order to deliver shortly.
                  </>
                ) : confirmedPaymentMethod === 'cod' ? (
                  <>
                    Thank you Zayn! Your Cash on Delivery order is registered. Please verify your contact details so the vendor can dispatch your shipment.
                  </>
                ) : (
                  <>
                    Thank you Zayn! Your credit card payment has been successfully secured under Villex Escrow. The merchant has been notified to ship your parcel.
                  </>
                )}
              </p>
            </div>

            {/* Details (Solid background inside opaque container, not transparent) */}
            <div className="bg-secondary/40 border border-border/80 rounded-xl p-5 w-full space-y-4">
              <div className="flex justify-between border-b border-border pb-3 text-xs md:text-sm">
                <span className="text-muted-foreground">Order Reference:</span>
                <span className="font-mono font-bold text-foreground">{orderId}</span>
              </div>

              <div className="flex justify-between border-b border-border pb-3 text-xs md:text-sm">
                <span className="text-muted-foreground">Order Status:</span>
                {confirmedPaymentMethod === 'wallet' ? (
                  <span className="font-black text-amber-500 uppercase flex items-center gap-1">
                    ⏱️ Pending verification
                  </span>
                ) : confirmedPaymentMethod === 'cod' ? (
                  <span className="font-black text-blue-400 uppercase flex items-center gap-1">
                    📦 Pending delivery
                  </span>
                ) : (
                  <span className="font-black text-emerald-400 uppercase flex items-center gap-1">
                    ✅ Paid (Escrow Locked)
                  </span>
                )}
              </div>

              <div className="flex justify-between border-b border-border pb-3 text-xs md:text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-bold text-foreground uppercase">
                  {confirmedPaymentMethod === 'wallet' && confirmedWallet
                    ? `Mobile Wallet (${confirmedWallet})`
                    : confirmedPaymentMethod}
                </span>
              </div>

              {confirmedPaymentMethod === 'wallet' && confirmedWalletTid && (
                <div className="flex justify-between border-b border-border pb-3 text-xs md:text-sm">
                  <span className="text-muted-foreground">Transaction ID (TID):</span>
                  <span className="font-mono font-bold text-foreground">{confirmedWalletTid}</span>
                </div>
              )}

              <div className="flex justify-between border-b border-border pb-3 text-xs md:text-sm">
                <span className="text-muted-foreground">Total Paid (Escrow):</span>
                <span className="font-bold text-primary font-mono text-base">PKR {confirmedTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <span className="font-bold text-emerald-400">June 16, 2026</span>
              </div>
            </div>

            {/* Next Steps actions */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full pt-2">
              <Link href="/dashboard?tab=orders" className="flex-1">
                <Button variant="outline" className="w-full h-11 text-xs font-semibold">
                  Track Order Status
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full h-11 text-xs font-semibold">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        /* One-Page Checkout Flow */
        <div className="container mx-auto px-4 py-8 flex-grow">
          {/* Header & Mode Toggler Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Checkout</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Consolidated single-page escrow payment portal.</p>
            </div>
            
            {/* Mode switch */}
            <div className="flex space-x-1 p-1 rounded-xl bg-secondary/35 border border-border self-start">
              <button
                onClick={() => setIsGuest(false)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                  !isGuest
                    ? 'bg-card text-foreground shadow border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Logged-In Mode
              </button>
              <button
                onClick={() => setIsGuest(true)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                  isGuest
                    ? 'bg-card text-foreground shadow border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Guest Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Steps Panel */}
            <div className="lg:col-span-8">
              <CheckoutSteps
                isGuest={isGuest}
                email={email}
                setEmail={setEmail}
                guestAddress={guestAddress}
                setGuestAddress={setGuestAddress}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardData={cardData}
                setCardData={setCardData}
                selectedWallet={selectedWallet}
                setSelectedWallet={setSelectedWallet}
                walletPhone={walletPhone}
                setWalletPhone={setWalletPhone}
                walletTid={walletTid}
                setWalletTid={setWalletTid}
              />
            </div>

            {/* Right Summary Panel */}
            <div className="lg:col-span-4 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-semibold leading-relaxed animate-pulse">
                  ⚠️ {errorMsg}
                </div>
              )}
              <CheckoutSummary
                items={checkoutItems}
                subtotal={subtotal}
                discountPercent={discountPercent}
                shippingFee={shippingFee}
                submitting={submitting}
                onSubmit={handlePlaceOrder}
                couponCode={discountPercent > 0 ? "VILLEX20" : ""}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="border-t border-border bg-card/10 py-6 text-center text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Villex Multi-Vendor Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
