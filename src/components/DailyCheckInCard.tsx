import { X } from 'lucide-react';

interface DailyCheckInCardProps {
  onDismiss: () => void;
  onStartCheckIn: () => void;
}

export function DailyCheckInCard({ onDismiss, onStartCheckIn }: DailyCheckInCardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600 rounded-xl p-6 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between relative">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">🔥</span>
              Ready for your daily check-in?
            </h3>
            <p className="text-orange-100 mb-4">
              Keep your momentum going! Track your habits and celebrate today's wins.
            </p>
            <button
              onClick={onStartCheckIn}
              className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Start Check-In
              <span className="ml-2">🎉</span>
            </button>
          </div>

          {/* Decorative Icon */}
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-5xl">🎯</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 