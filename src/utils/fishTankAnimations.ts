import { Fish, Bubble } from '../types';

// Fish emojis pool
export const FISH_EMOJIS = ['🐠', '🐟', '🦈', '🐡', '🟡', '🔵'];

// Bubble emojis pool
export const BUBBLE_EMOJIS: Array<'💧' | '🫧' | '○'> = ['💧', '🫧', '○'];

// Tank dimensions (will be used by component)
export const TANK_CONFIG = {
  width: 320,
  height: 240,
  sandHeight: 30,
  collapsedSize: 60,
};

// Generate random number between min and max
export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Create a new fish with random properties
export const createFish = (id: string): Fish => {
  const emoji = FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)];
  
  return {
    id,
    emoji,
    x: randomBetween(20, TANK_CONFIG.width - 40),
    y: randomBetween(20, TANK_CONFIG.height - TANK_CONFIG.sandHeight - 20),
    velocityX: randomBetween(-2, 2),
    velocityY: randomBetween(-1.5, 1.5),
    facingRight: Math.random() > 0.5,
    lastDirectionChange: Date.now(),
    speed: randomBetween(0.5, 2),
  };
};

// Create a new bubble at bottom of tank
export const createBubble = (id: string): Bubble => {
  const emoji = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
  
  return {
    id,
    emoji,
    x: randomBetween(10, TANK_CONFIG.width - 10),
    y: TANK_CONFIG.height - TANK_CONFIG.sandHeight,
    speed: randomBetween(0.8, 1.8),
    drift: randomBetween(-0.3, 0.3),
    opacity: 1,
  };
};

// Update fish position with omnidirectional movement
export const updateFishPosition = (fish: Fish): Fish => {
  const now = Date.now();
  let newFish = { ...fish };
  
  // Random direction change every 3-5 seconds
  if (now - fish.lastDirectionChange > randomBetween(3000, 5000)) {
    newFish.velocityX = randomBetween(-2, 2) * fish.speed;
    newFish.velocityY = randomBetween(-1.5, 1.5) * fish.speed;
    newFish.lastDirectionChange = now;
    
    // Update facing direction
    if (newFish.velocityX > 0.1) {
      newFish.facingRight = true;
    } else if (newFish.velocityX < -0.1) {
      newFish.facingRight = false;
    }
  }
  
  // Update position
  newFish.x += newFish.velocityX;
  newFish.y += newFish.velocityY;
  
  // Boundary collision detection and bounce
  const fishSize = 20; // Approximate emoji size
  
  // Left/right boundaries
  if (newFish.x <= fishSize || newFish.x >= TANK_CONFIG.width - fishSize) {
    newFish.velocityX = -newFish.velocityX;
    newFish.facingRight = newFish.velocityX > 0;
    newFish.x = Math.max(fishSize, Math.min(newFish.x, TANK_CONFIG.width - fishSize));
  }
  
  // Top/bottom boundaries
  if (newFish.y <= fishSize || newFish.y >= TANK_CONFIG.height - TANK_CONFIG.sandHeight - fishSize) {
    newFish.velocityY = -newFish.velocityY;
    newFish.y = Math.max(fishSize, Math.min(newFish.y, TANK_CONFIG.height - TANK_CONFIG.sandHeight - fishSize));
  }
  
  return newFish;
};

// Update bubble position (floating upward)
export const updateBubblePosition = (bubble: Bubble): Bubble => {
  const newBubble = { ...bubble };
  
  // Move bubble up with drift
  newBubble.y -= newBubble.speed;
  newBubble.x += newBubble.drift;
  
  // Fade out as it reaches the top
  const fadeStartY = 50;
  if (newBubble.y < fadeStartY) {
    newBubble.opacity = Math.max(0, newBubble.y / fadeStartY);
  }
  
  // Keep bubble within horizontal bounds
  if (newBubble.x < 0 || newBubble.x > TANK_CONFIG.width) {
    newBubble.drift = -newBubble.drift;
    newBubble.x = Math.max(0, Math.min(newBubble.x, TANK_CONFIG.width));
  }
  
  return newBubble;
};

// Check if bubble should be removed (reached top or faded out)
export const shouldRemoveBubble = (bubble: Bubble): boolean => {
  return bubble.y < 0 || bubble.opacity <= 0;
};

// Generate initial fish population
export const generateInitialFish = (count: number = 5): Fish[] => {
  return Array.from({ length: count }, (_, i) => createFish(`fish-${i}`));
};

// Tank click interaction - generate extra bubbles
export const generateClickBubbles = (clickX: number, clickY: number, count: number = 3): Bubble[] => {
  return Array.from({ length: count }, (_, i) => {
    const bubble = createBubble(`click-bubble-${Date.now()}-${i}`);
    bubble.x = clickX + randomBetween(-20, 20);
    bubble.y = clickY;
    return bubble;
  });
};

// Fish click interaction - speed boost
export const applyFishSpeedBoost = (fish: Fish): Fish => {
  const boostedFish = { ...fish };
  boostedFish.velocityX *= 2;
  boostedFish.velocityY *= 2;
  boostedFish.speed *= 1.5;
  return boostedFish;
};