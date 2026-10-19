import React, { useEffect } from 'react';
import { X, Clock, BookOpen, Download, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { orders, formatPrice } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="My orders and library modal"
    >
      <div 
        className="relative w-full max-w-2xl my-auto rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#1e90ff]/10 text-[#1e90ff]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">My Orders & Library</h3>
              <p className="text-xs text-slate-500 font-medium">
                Purchased titles, M-Pesa transaction records, and digital licenses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close orders modal"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-5 max-h-[440px] overflow-y-auto space-y-3 bg-slate-50/50">
          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Orders Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Once you complete an M-Pesa checkout, your digital books and official Safaricom transaction receipts will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-slate-700">{order.orderId}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a859]" />
                    M-Pesa ({order.mpesaReceiptNumber})
                  </span>
                </div>

                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900 font-semibold">Titles:</strong> {order.itemsSummary}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-extrabold text-slate-900">
                    {formatPrice(order.totalKes)}
                  </div>

                  <button
                    onClick={() => {
                      const blob = new Blob(
                        [`Midusa eLibrary Official Receipt\nOrder: ${order.orderId}\nM-Pesa Ref: ${order.mpesaReceiptNumber}\nAmount: ${order.totalKes} KES\nStatus: Paid & Verified\nThank you for reading!`],
                        { type: 'text/plain' }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `receipt-${order.mpesaReceiptNumber}.txt`;
                      a.click();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
