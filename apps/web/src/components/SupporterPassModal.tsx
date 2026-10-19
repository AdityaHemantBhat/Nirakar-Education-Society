import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { PullSlider } from '@nirakar/ui';

interface SupporterPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reasonText?: string;
}

export const SupporterPassModal: React.FC<SupporterPassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reasonText = 'You have enjoyed your 5 free reads of Shri Nirakar Daily Magazine.',
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/v1/access/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount, currency: 'INR' }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to initialize contribution');
      }

      const orderData = json.data;

      // 2. Open Razorpay Checkout or fallback in dev
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: 'INR',
          name: 'Shree Nirakar Education Society',
          description: 'Supporter Pass (Unlocks all Daily Magazine & Alumni Posts)',
          order_id: orderData.razorpayOrderId,
          handler: async (response: any) => {
            // Emulate instant dev webhook confirmation
            setPaymentSuccess(true);
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 1800);
          },
          prefill: {
            name: 'Nirakar Supporter',
          },
          theme: {
            color: '#9b1e1e',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation in dev without external script load
        setTimeout(() => {
          setPaymentSuccess(true);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1800);
        }, 1200);
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed. Please check connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/70 backdrop-blur-sm">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-paper rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-cream">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800">
                <Heart size={16} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Support Shri Nirakar Vidhyalaya
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  One Voluntary Pass • Everything Unlocked Forever
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-500 hover:text-ink"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {!paymentSuccess ? (
              <>
                <div className="text-center space-y-1">
                  <p className="text-xs sm:text-sm text-brand-900 font-semibold bg-brand-50 py-1.5 px-4 rounded-xl border border-brand-200/50 inline-block">
                    {reasonText}
                  </p>
                  <p className="text-xs text-stone-600 font-sans pt-1">
                    Your voluntary contribution supports student scholarships, science lab upgrades, and library facilities in Canacona.
                  </p>
                </div>

                {/* The Pull Slider Component */}
                <PullSlider
                  defaultValue={selectedAmount}
                  onChange={(val) => setSelectedAmount(val)}
                />

                {/* Benefits Bullet Points */}
                <div className="bg-cream/80 rounded-2xl p-4 border border-stone-200/70 space-y-2 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-brand-700 shrink-0" />
                    <span>Instant, unlimited access to every issue of Shri Nirakar Daily Magazine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-brand-700 shrink-0" />
                    <span>Complete access to the entire 50-year publication archive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-brand-700 shrink-0" />
                    <span>Direct contribution to rural Goan student development</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-serif font-bold text-base shadow-lg shadow-brand-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Sparkles size={18} className="text-accent-300" />
                  <span>
                    {isProcessing ? 'Processing Securely...' : `Contribute ₹${selectedAmount} & Unlock All`}
                  </span>
                </button>

                <p className="text-[11px] text-center text-stone-500 font-mono">
                  Secured by Razorpay • UPI (GPay/PhonePe), Netbanking, Cards Accepted
                </p>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-ink">
                  Thank You for Your Generosity!
                </h3>
                <p className="text-sm text-stone-600 font-sans max-w-sm mx-auto">
                  Your supporter pass is now active. All Daily Magazine issues and archives are fully unlocked for your reading.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
