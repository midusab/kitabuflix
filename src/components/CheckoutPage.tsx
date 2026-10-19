import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Download, 
  BookOpen, 
  Clock, 
  Copy, 
  Check, 
  Zap, 
  PhoneCall, 
  RotateCcw,
  ShoppingBag,
  Tag,
  ChevronRight,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/book';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onBackToHome: () => void;
  onOpenReader: (bookId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onBackToHome,
  onOpenReader
}) => {
  const { user } = useAuth();
  const { 
    cart, 
    cartSubtotalKes, 
    cartDiscountKes, 
    cartTotalKes, 
    formatPrice, 
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    promoError,
    placeOrder,
    clearCart,
    books,
    showToast
  } = useStore();

  // Miller's Law: 3 steps (1: Details, 2: M-Pesa STK Push, 3: Completed Receipt)
  const [step, setStep] = useState<'details' | 'stk-prompt' | 'success'>('details');

  // Form Details
  const [customerName, setCustomerName] = useState(user?.displayName || 'Achieng Ochieng');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'bochieng228@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Promo in Checkout
  const [promoInput, setPromoInput] = useState('');

  // STK Simulation Progress
  const [progressPercent, setProgressPercent] = useState(0);
  const [simulatedPin, setSimulatedPin] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Format Safaricom Phone Number
  const validatePhone = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    // Kenyan Safaricom formats: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX
    if (clean.length === 10 && (clean.startsWith('07') || clean.startsWith('01'))) {
      return true;
    }
    if (clean.length === 12 && (clean.startsWith('2547') || clean.startsWith('2541'))) {
      return true;
    }
    return false;
  };

  const handleInitiateSTKPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Please enter your full name for book licensing.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      showToast('Please enter a valid email for order receipts.');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid Safaricom number (e.g. 0712345678 or 254712345678)');
      return;
    }

    setPhoneError(null);
    setStep('stk-prompt');
    setProgressPercent(15);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Simulate STK notification arrival
    setTimeout(() => setProgressPercent(45), 1000);
    setTimeout(() => setProgressPercent(75), 2200);
  };

  const handleSimulatePinAuthorize = async () => {
    setIsProcessing(true);
    setProgressPercent(90);

    // Random Safaricom M-Pesa Receipt Number e.g. "SBX8K491Q9"
    const receiptChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomReceipt = 'SBX';
    for (let i = 0; i < 7; i++) {
      randomReceipt += receiptChars.charAt(Math.floor(Math.random() * receiptChars.length));
    }

    try {
      const order = await placeOrder(
        {
          name: customerName,
          phone: phoneNumber,
          email: customerEmail,
        },
        randomReceipt
      );

      setProgressPercent(100);
      setCompletedOrder(order);
      setStep('success');

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00a859', '#1e90ff', '#e50914', '#ffd700'],
        });
      } catch {
        // Safe fallback
      }
      showToast('M-Pesa payment confirmed! Your books are ready.');
    } catch {
      showToast('Error processing order. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReceipt = () => {
    if (completedOrder?.mpesaReceiptNumber) {
      navigator.clipboard.writeText(completedOrder.mpesaReceiptNumber);
      setCopiedReceipt(true);
      showToast('M-Pesa reference copied!');
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-in fade-in duration-200">
      {/* Top Breadcrumbs & Secure Return Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={step === 'success' ? onBackToHome : onBackToCart}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300"
            aria-label="Back to previous page"
          >
            <ArrowLeft className="w-4 h-4 text-[#1e90ff]" />
            <span>{step === 'success' ? 'Back to Bookstore' : 'Back to Shopping Cart'}</span>
          </button>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button onClick={onBackToHome} className="hover:text-[#1e90ff] cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button onClick={onBackToCart} className="hover:text-[#1e90ff] cursor-pointer">
              Shopping Cart
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#1e90ff] font-bold">Secure M-Pesa Checkout</span>
          </nav>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#00a859]">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
        {/* Miller's Law: 3 Progressive Steps Header */}
        <section aria-label="Checkout Progress" className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black mb-1.5 ${
                  step === 'details'
                    ? 'bg-[#1e90ff] text-white shadow-md'
                    : 'bg-[#00a859] text-white'
                }`}>
                  {step !== 'details' ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-xs font-bold ${
                  step === 'details' ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  1. Contact Details
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black mb-1.5 ${
                  step === 'stk-prompt'
                    ? 'bg-[#00a859] text-white shadow-md animate-pulse'
                    : step === 'success'
                    ? 'bg-[#00a859] text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {step === 'success' ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <span className={`text-xs font-bold ${
                  step === 'stk-prompt' ? 'text-[#00a859]' : 'text-slate-500'
                }`}>
                  2. M-Pesa PIN Push
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black mb-1.5 ${
                  step === 'success'
                    ? 'bg-[#1e90ff] text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  3
                </div>
                <span className={`text-xs font-bold ${
                  step === 'success' ? 'text-[#1e90ff]' : 'text-slate-500'
                }`}>
                  3. Instant Access
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Success Screen (No popup!) */}
        {step === 'success' && completedOrder && (
          <section 
            aria-label="Order Confirmation"
            className="bg-white rounded-lg border border-slate-200 shadow-md p-6 sm:p-10 text-center animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-md bg-[#00a859]/10 text-[#00a859] flex items-center justify-center mx-auto mb-4 border border-[#00a859]/20 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#00a859]" />
            </div>

            <span className="px-3 py-1 rounded-xs bg-[#00a859]/10 text-[#00a859] text-xs font-black uppercase tracking-wider inline-block mb-2">
              Payment Confirmed & Verified
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mt-1 mb-8">
              Your books have been bound to your digital library. An encrypted backup has also been dispatched to <strong className="text-slate-800">{customerEmail}</strong>.
            </p>

            {/* Official M-Pesa Receipt Card (Liquid Glass Aesthetics) */}
            <div className="max-w-lg mx-auto p-5 sm:p-6 rounded-md bg-[#0b1325] text-white border border-slate-800 shadow-xl text-left mb-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-xs bg-[#00a859] flex items-center justify-center text-white font-black text-xs">
                    M
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Safaricom Lipa Na M-Pesa
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {completedOrder.createdAt}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">M-Pesa Receipt Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-sm">
                      {completedOrder.mpesaReceiptNumber}
                    </span>
                    <button
                      onClick={handleCopyReceipt}
                      className="p-1 rounded-xs bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                      title="Copy M-Pesa reference code"
                    >
                      {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-bold text-white text-sm">{formatPrice(completedOrder.totalKes)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Paid To:</span>
                  <span className="font-semibold text-slate-200">Midusa eLibrary (Paybill 408221)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-semibold text-slate-200">{completedOrder.customerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <span className="font-mono text-slate-300">{completedOrder.customerPhone}</span>
                </div>

                <div className="pt-2 border-t border-white/10 text-slate-400 flex justify-between">
                  <span>Purchased Titles:</span>
                  <span className="text-right text-slate-200 font-semibold max-w-[240px] truncate">
                    {completedOrder.itemsSummary}
                  </span>
                </div>
              </div>
            </div>

            {/* Post-Purchase Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onBackToHome}
                className="px-6 py-3 rounded-md bg-[#1e90ff] hover:bg-[#1873cd] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg shadow-[#1e90ff]/25 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Return to Bookstore Catalog</span>
              </button>

              <button
                onClick={() => {
                  const firstBook = books.find((b) => completedOrder.itemsSummary.includes(b.title));
                  if (firstBook) onOpenReader(firstBook.id);
                  else onBackToHome();
                }}
                className="px-6 py-3 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg shadow-[#00a859]/25 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Read in Digital Library Now</span>
              </button>
            </div>
          </section>
        )}

        {/* Step 1 & 2: Checkout Form & STK Push Simulation */}
        {step !== 'success' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Form or STK Prompt */}
            <div className="lg:col-span-7 space-y-6">
              {step === 'details' ? (
                /* Chunk 1: Customer Contact & Delivery Details */
                <form onSubmit={handleInitiateSTKPush} className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#00a859]" />
                      <span>Contact & Safaricom M-Pesa Details</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Provide your Safaricom mobile phone to receive the direct STK PIN push prompt on your handset.
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name (eBook Reader Licensee)
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Achieng Ochieng"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-[#1e90ff] focus:ring-2 focus:ring-[#1e90ff]/20 text-xs sm:text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address (for Receipt & ePub Download)
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. reader@example.com"
                      className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 focus:border-[#1e90ff] focus:ring-2 focus:ring-[#1e90ff]/20 text-xs sm:text-sm font-semibold text-slate-900 bg-white"
                    />
                  </div>

                  {/* Safaricom Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Safaricom Mobile Number (M-Pesa)
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setPhoneError(null);
                        }}
                        placeholder="0712345678 or 254712345678"
                        className={`w-full px-3.5 py-2.5 rounded-md border text-xs sm:text-sm font-mono font-bold text-slate-900 bg-white ${
                          phoneError
                            ? 'border-[#e50914] focus:ring-2 focus:ring-[#e50914]/20'
                            : 'border-slate-300 focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-[11px] font-bold text-[#00a859] bg-[#00a859]/10 px-2 py-0.5 rounded-xs">
                        Safaricom
                      </span>
                    </div>
                    {phoneError && (
                      <p className="text-xs text-[#e50914] font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  {/* Safaricom Lipa na M-Pesa Highlights */}
                  <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 font-medium">
                    <div className="flex items-center gap-1.5 font-bold text-[#00a859]">
                      <ShieldCheck className="w-4 h-4 text-[#00a859]" />
                      <span>Official Safaricom Lipa na M-Pesa Online (Daraja 2.0)</span>
                    </div>
                    <p>
                      Upon tapping "Send M-Pesa Prompt", a secure dialog will pop up automatically on your phone asking for your M-Pesa PIN.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Merchant Paybill: <strong>408221</strong> (Midusa eLibrary) • Zero transaction charges.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#00a859]/25 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    <span>Send M-Pesa Prompt ({formatPrice(cartTotalKes)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Chunk 2: STK Push Progress & PIN Entry Screen */
                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#00a859]" />
                        <span>M-Pesa STK Push Sent</span>
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Please check your phone screen <strong className="text-slate-800">{phoneNumber}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('details')}
                      className="text-xs font-bold text-[#1e90ff] hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* Interactive Safaricom Phone Mockup */}
                  <div className="max-w-md mx-auto p-5 rounded-md bg-[#0f172a] text-white border-2 border-emerald-500 shadow-2xl relative">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                        SAFARICOM M-PESA
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">SIM Toolkit</span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed mb-4">
                      Do you want to pay Midusa eLibrary <strong className="text-white">{formatPrice(cartTotalKes)}</strong> to Paybill <strong className="text-white">408221</strong>?
                    </p>

                    <div className="p-3 rounded-xs bg-black/40 border border-white/10 mb-4 text-center">
                      <span className="text-xs text-slate-400 block mb-1">Enter 4-Digit M-Pesa PIN:</span>
                      <div className="text-lg font-mono tracking-[0.4em] text-emerald-400 font-bold">
                        ••••
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSimulatePinAuthorize}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 px-4 rounded-xs bg-[#00a859] hover:bg-[#00924d] text-white text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessing ? 'Verifying PIN...' : 'Authorize & Pay'}</span>
                      </button>

                      <button
                        onClick={() => setStep('details')}
                        className="py-2.5 px-3 rounded-xs bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Fallback Paybill Instructions */}
                  <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <span className="font-bold text-slate-900 block">
                      STK Prompt didn't appear on your phone?
                    </span>
                    <p>
                      You can also pay manually: Go to <strong>M-Pesa → Lipa na M-Pesa → Paybill</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold text-slate-800">
                      <div className="p-2 bg-white rounded-xs border border-slate-200">
                        Business No: <strong>408221</strong>
                      </div>
                      <div className="p-2 bg-white rounded-xs border border-slate-200">
                        Account No: <strong>MIDUSA</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Chunk 3 - Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <section aria-label="Order Summary" className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#1e90ff]" />
                    <span>Order Summary</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    {cart.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>

                {/* Items in Cart */}
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto space-y-2.5">
                  {cart.map((item) => (
                    <div key={item.bookId} className="pt-2.5 first:pt-0 flex items-center gap-3">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded-xs border border-slate-200 shadow-xs flex-none"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.format} • Qty {item.quantity}
                        </p>
                        <span className="text-xs font-black text-slate-900 block mt-1">
                          {formatPrice(item.priceKes * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Promo code (e.g. MIDUSA20)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs font-bold rounded-xs border border-slate-300 focus:border-[#1e90ff] uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (promoInput.trim()) {
                          applyPromoCode(promoInput.trim());
                          setPromoInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xs bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#00a859] bg-[#00a859]/10 px-2.5 py-1 rounded-xs">
                      <span>Applied: {appliedPromo.code} ({appliedPromo.description})</span>
                      <button
                        onClick={removePromoCode}
                        aria-label="Remove promo code"
                        className="text-slate-400 hover:text-rose-600 cursor-pointer ml-2 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-xs text-[#e50914] font-medium mt-1">{promoError}</p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span>{formatPrice(cartSubtotalKes)}</span>
                  </div>

                  {cartDiscountKes > 0 && (
                    <div className="flex justify-between text-[#00a859] font-bold">
                      <span>Promo Discount:</span>
                      <span>-{formatPrice(cartDiscountKes)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>M-Pesa Transaction Fee:</span>
                    <span className="text-[#00a859] font-bold">FREE (0.00 KES)</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-[#1e90ff]">{formatPrice(cartTotalKes)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
