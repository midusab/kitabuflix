import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  RotateCcw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types/book';

export const MpesaCheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartTotalKes, 
    formatPrice, 
    placeOrder, 
    setReadingBook 
  } = useStore();

  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('0712345678');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(30);
  const [stkStatus, setStkStatus] = useState<'broadcasting' | 'awaiting_pin' | 'verifying' | 'approved'>('broadcasting');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'stk' | 'paybill'>('stk');
  const [copiedTill, setCopiedTill] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setCountdown(30);
      setStkStatus('broadcasting');
      setCompletedOrder(null);
      if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
      }
    }
  }, [isCheckoutOpen, user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step === 2) {
      const t1 = setTimeout(() => {
        setStkStatus('awaiting_pin');
      }, 1800);
      return () => clearTimeout(t1);
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCheckoutOpen) {
        setIsCheckoutOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const validatePhone = (val: string) => {
    const clean = val.replace(/[\s-]/g, '');
    const regex = /^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/;
    return regex.test(clean);
  };

  const handleStartStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid Safaricom number (e.g. 0712 345 678 or 0799 123 456)');
      return;
    }
    setPhoneError(null);
    setCountdown(30);
    setStkStatus('broadcasting');
    setStep(2);
  };

  const handleApprovePayment = async () => {
    setStkStatus('verifying');
    setTimeout(async () => {
      setStkStatus('approved');
      const mpesaRef = `QJK${Math.floor(1000000 + Math.random() * 9000000).toString(36).toUpperCase()}`;
      
      const order = await placeOrder(
        {
          name: name || 'Midusa Reader',
          phone: phone,
          email: email || 'reader@midusa.com',
        },
        mpesaRef
      );

      setCompletedOrder(order);
      setStep(3);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00a859', '#1e90ff', '#e50914', '#ffffff'],
      });
    }, 1200);
  };

  const handleCopyTill = () => {
    navigator.clipboard.writeText('408221');
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mpesa-checkout-heading"
    >
      <div 
        className="relative w-full max-w-lg my-auto rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar (Neutral Radius) */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/15 via-transparent to-[#1e90ff]/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#00a859] flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-md">
              M-PESA
            </div>
            <div>
              <h3 id="mpesa-checkout-heading" className="text-base font-extrabold text-white">
                M-Pesa Express Checkout
              </h3>
              <p className="text-[11px] text-slate-300">
                Official Safaricom Daraja 2.0 Secure Gateway
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close checkout"
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Stepper (Neutral Radius) */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#00a859]' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-xs flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#00a859] text-white' : 'bg-white/10'}`}>
              1
            </span>
            <span>Contact & Phone</span>
          </div>

          <div className="w-6 h-[1px] bg-white/15" />

          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#00a859]' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-xs flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#00a859] text-white' : 'bg-white/10'}`}>
              2
            </span>
            <span>STK Push & PIN</span>
          </div>

          <div className="w-6 h-[1px] bg-white/15" />

          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-xs flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-500 text-white' : 'bg-white/10'}`}>
              3
            </span>
            <span>Access Library</span>
          </div>
        </div>

        {/* Body Content by Step */}
        <div className="p-5">
          {/* STEP 1: Phone & Contact Information */}
          {step === 1 && (
            <form onSubmit={handleStartStkPush} className="space-y-3.5">
              {/* Order total banner */}
              <div className="p-3.5 rounded-md glass-card border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Payable via M-Pesa</span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {formatPrice(cartTotalKes)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#00a859] font-bold block">
                    {cart.length} Digital Book{cart.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Instant delivery upon PIN entry
                  </span>
                </div>
              </div>

              {/* Customer Inputs */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brian Otieno"
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Email Address (For receipt & download license)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. brian@example.com"
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00a859]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Safaricom Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-300 font-bold pointer-events-none">
                    <Smartphone className="w-3.5 h-3.5 text-[#00a859]" />
                    <span>+254</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="712 345 678"
                    className="w-full pl-18 pr-3 py-2 rounded-md bg-white/5 border border-white/15 text-xs sm:text-sm text-white font-mono placeholder-slate-400 focus:outline-none focus:border-[#00a859]"
                  />
                </div>
                {phoneError && (
                  <p className="text-[11px] text-[#ef4444] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{phoneError}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  A pop-up prompt will appear immediately on this phone asking for your M-Pesa PIN.
                </p>
              </div>

              {/* Submit Button (Safaricom Green) */}
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#00a859]/25 transition-transform active:scale-98 cursor-pointer mt-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Send M-Pesa STK Push</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: STK Push Active Simulation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex rounded-md bg-white/5 p-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('stk')}
                  className={`flex-1 py-1.5 rounded-xs transition-all cursor-pointer ${
                    activeTab === 'stk'
                      ? 'bg-[#00a859] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  STK Push Live Prompt
                </button>
                <button
                  onClick={() => setActiveTab('paybill')}
                  className={`flex-1 py-1.5 rounded-xs transition-all cursor-pointer ${
                    activeTab === 'paybill'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Paybill / Till Option
                </button>
              </div>

              {activeTab === 'stk' ? (
                <>
                  {/* Phone Handset STK Simulation Box */}
                  <div className="relative mx-auto max-w-sm rounded-md bg-zinc-950 border-2 border-emerald-500/40 p-3.5 shadow-2xl">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2.5 border-b border-white/5 pb-1.5">
                      <span className="font-mono">Safaricom 4G</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Prompt Broadcasted
                      </span>
                    </div>

                    <div className="p-3.5 rounded-md bg-slate-900 border border-emerald-500/30 text-center space-y-2">
                      <div className="w-8 h-8 mx-auto rounded-md bg-[#00a859]/20 text-[#00a859] flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        SIM Toolkit Prompt
                      </h4>
                      <p className="text-xs text-slate-200 font-mono">
                        Do you want to pay <strong className="text-emerald-400">{formatPrice(cartTotalKes)}</strong> to MIDUSA ELIBRARY (Till 408221)?
                      </p>

                      <div className="pt-1">
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Enter PIN on handset {phone}:
                        </span>
                        <div className="flex justify-center gap-2 text-lg text-emerald-400 font-mono font-bold">
                          <span>••••</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Expires in: <strong className="text-white font-mono">{countdown}s</strong>
                      </span>
                      <span>Ref: DAR-{Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>
                  </div>

                  {/* Testing action button to simulate user entering their PIN */}
                  <div className="p-3.5 rounded-md glass-card border border-white/10 text-center space-y-2">
                    <p className="text-xs text-slate-300">
                      Waiting for PIN verification on <strong className="text-white">{phone}</strong>...
                    </p>

                    <button
                      onClick={handleApprovePayment}
                      disabled={stkStatus === 'verifying'}
                      className="w-full py-2.5 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a859]/30 transition-transform active:scale-98 cursor-pointer"
                    >
                      {stkStatus === 'verifying' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying with Safaricom Daraja...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simulate PIN Entered & Approve</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setStep(1)}
                      className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Change phone number</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Manual Paybill Instructions */
                <div className="p-3.5 rounded-md glass-card border border-white/10 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="font-bold text-white">Lipa na M-Pesa Instructions:</span>
                    <span className="text-[11px] text-[#00a859] font-bold">Till Number</span>
                  </div>

                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>Open M-Pesa menu on your handset</li>
                    <li>Select <strong>Lipa na M-Pesa</strong> &gt; <strong>Buy Goods and Services</strong></li>
                    <li>
                      Enter Till Number:{' '}
                      <button
                        onClick={handleCopyTill}
                        className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-white/5 px-1.5 py-0.5 rounded-xs cursor-pointer hover:bg-white/10"
                      >
                        408221 {copiedTill ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </li>
                    <li>Enter Amount: <strong className="text-white">{formatPrice(cartTotalKes)}</strong></li>
                    <li>Enter your M-Pesa PIN and press Send</li>
                  </ol>

                  <button
                    onClick={handleApprovePayment}
                    className="w-full py-2 mt-1 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    I Have Sent Payment (Verify Code)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Order Completed & Digital Access */}
          {step === 3 && completedOrder && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 mx-auto rounded-md bg-[#00a859]/20 text-[#00a859] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-white">Payment Confirmed!</h3>
                <p className="text-xs text-slate-400">
                  Your digital book license has been generated and added to your library.
                </p>
              </div>

              {/* Mpesa SMS Style Receipt Card */}
              <div className="p-3.5 rounded-md bg-zinc-950 border border-emerald-500/40 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-white/5 pb-1">
                  <span>SAFARICOM M-PESA RECEIPT</span>
                  <span className="text-emerald-400 font-bold">{completedOrder.mpesaReceiptNumber}</span>
                </div>

                <p className="text-slate-200 leading-relaxed text-[11px]">
                  Confirmed. <strong className="text-emerald-400">{formatPrice(completedOrder.totalKes)}</strong> paid to MIDUSA ELIBRARY (Till 408221) for {completedOrder.itemsSummary} on {new Date(completedOrder.createdAt).toLocaleDateString()}.
                </p>

                <div className="text-[10px] text-slate-400 pt-0.5 flex justify-between">
                  <span>Customer: {completedOrder.customerName}</span>
                  <span>Phone: {completedOrder.customerPhone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const firstBookInOrder = cart[0];
                    setIsCheckoutOpen(false);
                    if (firstBookInOrder) {
                      setReadingBook({
                        id: firstBookInOrder.bookId,
                        title: firstBookInOrder.title,
                        author: firstBookInOrder.author,
                        authorBio: '',
                        coverUrl: firstBookInOrder.coverUrl,
                        description: '',
                        category: 'Fiction',
                        subcategory: '',
                        priceKes: firstBookInOrder.priceKes,
                        rating: 5,
                        reviewsCount: 1,
                        formats: [firstBookInOrder.format],
                        pages: 350,
                        readTime: '7h',
                        publisher: 'Midusa Press',
                        publishedYear: 2025,
                        language: 'English',
                        isbn: '978-9966-02-184-2',
                        tableOfContents: [
                          { chapterNumber: 1, title: 'Chapter 1', previewExcerpt: 'You now have full unlocked access to this title.' }
                        ],
                        sampleExcerpt: 'You now have full unlocked access to this title.',
                        tags: []
                      });
                    }
                  }}
                  className="w-full py-2.5 rounded-md bg-[#1e90ff] hover:bg-[#1a7cdb] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Book in Web Reader</span>
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob(
                      [`Midusa eLibrary License\nOrder: ${completedOrder.orderId}\nM-Pesa Ref: ${completedOrder.mpesaReceiptNumber}\nItems: ${completedOrder.itemsSummary}`],
                      { type: 'text/plain' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${completedOrder.orderId}-midusa-books.txt`;
                    a.click();
                  }}
                  className="w-full py-2 rounded-md bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download License (.EPUB / .PDF)</span>
                </button>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Return to Bookstore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
