import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fish, Bubble } from '../types';
import {
  TANK_CONFIG,
  createBubble,
  updateFishPosition,
  updateBubblePosition,
  shouldRemoveBubble,
  generateInitialFish,
  generateClickBubbles,
  applyFishSpeedBoost,
} from '../utils/fishTankAnimations';

const FishTank: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fish, setFish] = useState<Fish[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animationFrameRef = useRef<number>();
  const bubbleIntervalRef = useRef<NodeJS.Timeout>();
  const bubbleCountRef = useRef(0);

  // Initialize fish when tank expands
  useEffect(() => {
    if (isExpanded && fish.length === 0) {
      setFish(generateInitialFish(5));
      setIsAnimating(true);
    } else if (!isExpanded) {
      setFish([]);
      setBubbles([]);
      setIsAnimating(false);
    }
  }, [isExpanded, fish.length]);

  // Animation loop for fish movement
  const animateElements = useCallback(() => {
    if (!isAnimating || !isExpanded) return;

    setFish(currentFish => currentFish.map(updateFishPosition));
    
    setBubbles(currentBubbles => 
      currentBubbles
        .map(updateBubblePosition)
        .filter(bubble => !shouldRemoveBubble(bubble))
    );

    animationFrameRef.current = requestAnimationFrame(animateElements);
  }, [isAnimating, isExpanded]);

  // Start/stop animation loop
  useEffect(() => {
    if (isAnimating && isExpanded) {
      animationFrameRef.current = requestAnimationFrame(animateElements);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateElements, isAnimating, isExpanded]);

  // Bubble generation interval
  useEffect(() => {
    if (isExpanded && isAnimating) {
      bubbleIntervalRef.current = setInterval(() => {
        setBubbles(currentBubbles => [
          ...currentBubbles,
          createBubble(`bubble-${bubbleCountRef.current++}`)
        ]);
      }, 2500);
    } else if (bubbleIntervalRef.current) {
      clearInterval(bubbleIntervalRef.current);
    }

    return () => {
      if (bubbleIntervalRef.current) {
        clearInterval(bubbleIntervalRef.current);
      }
    };
  }, [isExpanded, isAnimating]);

  // Handle tank click/touch for extra bubbles
  const handleTankInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isExpanded) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
      clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    
    const extraBubbles = generateClickBubbles(clickX, clickY, 3);
    setBubbles(currentBubbles => [...currentBubbles, ...extraBubbles]);
  };

  // Handle fish click/touch for speed boost
  const handleFishInteraction = (clickedFishId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setFish(currentFish => 
      currentFish.map(f => 
        f.id === clickedFishId ? applyFishSpeedBoost(f) : f
      )
    );
  };

  // Toggle expand/collapse
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  if (!isExpanded) {
    // Collapsed state - beautiful minimalistic button
    return (
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={toggleExpanded}
          className="w-14 h-14 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center text-2xl"
          title="Open Fish Tank"
        >
          🐠
        </button>
      </div>
    );
  }

  // Expanded state - full fish tank
  return (
    <div className="fixed bottom-5 left-5 z-40">
      {/* Background overlay for click-outside to close */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 -z-10"
        onClick={() => setIsExpanded(false)}
      />
      
      {/* Fish Tank */}
      <div
        className="relative bg-gradient-to-b from-sky-300 via-blue-400 to-blue-800 rounded-lg shadow-2xl border-4 border-blue-900 overflow-hidden animate-in zoom-in duration-300"
        style={{ 
          width: TANK_CONFIG.width, 
          height: TANK_CONFIG.height 
        }}
        onClick={handleTankInteraction}
        onTouchEnd={handleTankInteraction}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
          title="Close Fish Tank"
        >
          ✕
        </button>

        {/* Fish */}
        {fish.map((f) => (
          <div
            key={f.id}
            className="absolute cursor-pointer hover:scale-110 transition-transform duration-200 text-xl select-none"
            style={{
              left: f.x,
              top: f.y,
              transform: f.facingRight ? 'scaleX(1)' : 'scaleX(-1)',
            }}
            onClick={(e) => handleFishInteraction(f.id, e)}
            onTouchEnd={(e) => handleFishInteraction(f.id, e)}
            title="Click me!"
          >
            {f.emoji}
          </div>
        ))}

        {/* Bubbles */}
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute text-sm select-none pointer-events-none"
            style={{
              left: bubble.x,
              top: bubble.y,
              opacity: bubble.opacity,
            }}
          >
            {bubble.emoji}
          </div>
        ))}

        {/* Sand bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-800 to-yellow-600"
          style={{ height: TANK_CONFIG.sandHeight }}
        />

        {/* Seaweed */}
        <div className="absolute bottom-7 left-8 text-2xl animate-pulse">
          🌿
        </div>
        <div className="absolute bottom-5 left-24 text-xl animate-pulse" style={{ animationDelay: '1s' }}>
          🌿
        </div>
        <div className="absolute bottom-8 right-12 text-2xl animate-pulse" style={{ animationDelay: '2s' }}>
          🌿
        </div>

        {/* Starfish */}
        <div className="absolute bottom-2 left-16 text-lg">
          ⭐
        </div>
        <div className="absolute bottom-1 right-8 text-xl">
          ⭐
        </div>

        {/* Coral */}
        <div className="absolute bottom-4 right-24 text-lg">
          🪸
        </div>

        {/* Instructions */}
        <div className="absolute top-8 left-4 right-4 text-center">
          <p className="text-white text-xs bg-black bg-opacity-30 rounded px-2 py-1 backdrop-blur-sm">
            Click fish to boost them! Click water for bubbles!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FishTank;