import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Download, Share2, Twitter, Facebook, Copy, Instagram, LinkIcon, Sparkles, Crown } from 'lucide-react';
import html2canvas from 'html2canvas';
import PremiumFeatureManager from './PremiumFeatureManager';

// Actionable Button Component
function ActionableButton({ 
  icon, 
  label, 
  isPremium, 
  onClick 
}: {
  icon: React.ReactNode;
  label: string;
  isPremium: boolean;
  onClick: () => void;
}) {
  const ButtonContent = () => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
        bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors
        ${isPremium ? 'border border-yellow-400/50' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
      {isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
    </motion.button>
  );

  if (isPremium) {
    return (
      <PremiumFeatureManager feature="ai-coach" showUpgrade={false}>
        <ButtonContent />
      </PremiumFeatureManager>
    );
  }

  return <ButtonContent />;
}

interface ShareableInsightCardProps {
  insight: {
    id: string;
    text: string;
    type: 'motivation' | 'reflection' | 'challenge' | 'celebration' | 'wisdom';
    mood?: string;
    streak?: number;
    date: string;
    userName?: string;
  };
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  getActionableButtons?: (insight: any) => Array<{icon: React.ReactNode, label: string, action: string, isPremium: boolean}>;
  onActionableButtonClick?: (action: string, insight: any) => void;
}

export default function ShareableInsightCard({ 
  insight, 
  onSwipeLeft, 
  onSwipeRight, 
  onShare, 
  onSave,
  getActionableButtons,
  onActionableButtonClick
}: ShareableInsightCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - like/save
      setIsLiked(true);
      onSwipeRight?.();
    } else if (info.offset.x < -threshold) {
      // Swipe left - skip/next
      onSwipeLeft?.();
    }
  };

  const getCardGradient = () => {
    switch (insight.type) {
      case 'motivation':
        return 'from-orange-400 via-red-500 to-pink-500';
      case 'reflection':
        return 'from-purple-400 via-pink-500 to-red-500';
      case 'challenge':
        return 'from-blue-400 via-purple-500 to-pink-500';
      case 'celebration':
        return 'from-green-400 via-blue-500 to-purple-500';
      case 'wisdom':
        return 'from-indigo-400 via-purple-500 to-pink-500';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  const getEmoji = () => {
    switch (insight.type) {
      case 'motivation': return '🚀';
      case 'reflection': return '🤔';
      case 'challenge': return '⚡';
      case 'celebration': return '🎉';
      case 'wisdom': return '💎';
      default: return '✨';
    }
  };

  const formatInsightText = (text: string) => {
    // Break text into readable chunks with emphasis
    const sentences = text.split('. ');
    return sentences.map((sentence, index) => {
      if (index === 0) {
        return (
          <span key={index} className="text-2xl font-bold leading-tight">
            {sentence}{sentences.length > 1 ? '.' : ''}
          </span>
        );
      }
      return (
        <span key={index} className="text-lg leading-relaxed opacity-90">
          {sentence}{index < sentences.length - 1 ? '.' : ''}
        </span>
      );
    });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
        className="relative w-full max-w-sm aspect-[9/16] cursor-grab active:cursor-grabbing"
      >
        {/* Main Card */}
        <div className={`
          relative w-full h-full rounded-3xl overflow-hidden shadow-2xl
          bg-gradient-to-br ${getCardGradient()}
          flex flex-col justify-between p-8 text-white
        `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/15 blur-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        {/* Header */}
          <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <div className="text-4xl">{getEmoji()}</div>
              <div>
                <div className="text-sm font-semibold opacity-90">
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                </div>
                {insight.streak && (
                  <div className="text-xs opacity-75">
                    🔥 {insight.streak} day streak
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75">
                {new Date(insight.date).toLocaleDateString()}
              </div>
              {insight.mood && (
                <div className="text-xs opacity-75 mt-1">
                  Mood: {insight.mood}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Buttons */}
          {getActionableButtons && (
            <div className="relative z-10 mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {getActionableButtons(insight).map((button, index) => (
                  <ActionableButton
                    key={index}
                    icon={button.icon}
                    label={button.label}
                    isPremium={button.isPremium}
                    onClick={() => onActionableButtonClick?.(button.action, insight)}
                  />
                ))}
        </div>
            </div>
          )}

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              {formatInsightText(insight.text)}
            </div>
          </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="text-xs opacity-75">
                {insight.userName || 'Anonymous'}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  setIsLiked(!isLiked);
                  onSave?.();
                }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isLiked ? 'bg-red-500' : 'bg-white/20'}
                  backdrop-blur-sm transition-colors
                `}
              >
                <span className={`text-xl ${isLiked ? '❤️' : '🤍'}`}>
                  {isLiked ? '❤️' : '🤍'}
                </span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={onShare}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <span className="text-xl">📤</span>
              </motion.button>
            </div>
          </div>

          {/* Swipe Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/60"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
          </div>
        </div>

        {/* Swipe Hint Overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showActions ? 0 : 1 }}
          className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none"
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm">← Skip | Save →</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Side Action Indicators */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: x.get() > 50 ? 1 : 0 }}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-6xl"
      >
        ❤️
      </motion.div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: x.get() < -50 ? 1 : 0 }}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 text-6xl"
      >
        ⏭️
      </motion.div>
            </div>
  );
}

// Stack of Insight Cards Component
export function InsightCardStack({ 
  insights, 
  onCardAction,
  getActionableButtons,
  onActionableButtonClick
}: { 
  insights: any[];
  onCardAction?: (action: string, insight: any) => void;
  getActionableButtons?: (insight: any) => Array<{icon: React.ReactNode, label: string, action: string, isPremium: boolean}>;
  onActionableButtonClick?: (action: string, insight: any) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleSwipeLeft = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev + 1) % insights.length);
    onCardAction?.('skip', insights[currentIndex]);
  };

  const handleSwipeRight = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % insights.length);
    onCardAction?.('save', insights[currentIndex]);
  };

  const handleShare = () => {
    onCardAction?.('share', insights[currentIndex]);
    // Implement native sharing
    if (navigator.share) {
      navigator.share({
        title: 'My Momentum Insight',
        text: insights[currentIndex].text,
        url: window.location.href
      });
    }
  };

  if (!insights.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🌱</div>
          <div className="text-xl font-semibold mb-2">No insights yet</div>
          <div className="text-sm">Complete your daily check-in to get personalized insights!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Stack Effect - Show 3 cards */}
      {[0, 1, 2].map((offset) => {
        const cardIndex = (currentIndex + offset) % insights.length;
        const insight = insights[cardIndex];
        
        return (
          <motion.div
            key={`${cardIndex}-${currentIndex}`}
            initial={{ 
              scale: 1 - offset * 0.05,
              y: offset * 10,
              opacity: 1 - offset * 0.3
            }}
            animate={{ 
              scale: 1 - offset * 0.05,
              y: offset * 10,
              opacity: 1 - offset * 0.3
            }}
            className={`absolute inset-0 ${offset > 0 ? 'pointer-events-none' : ''}`}
            style={{ zIndex: 10 - offset }}
          >
            <ShareableInsightCard
              insight={insight}
              onSwipeLeft={offset === 0 ? handleSwipeLeft : undefined}
              onSwipeRight={offset === 0 ? handleSwipeRight : undefined}
              onShare={offset === 0 ? handleShare : undefined}
              onSave={offset === 0 ? () => onCardAction?.('save', insight) : undefined}
            />
          </motion.div>
        );
      })}

      {/* Progress Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-1">
          {insights.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 