// CardRoller.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CardRollerProps {
  cards: string[];
  targetIndex?: number;
  duration?: number;
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 120;
const MARGIN = 10;
const SPACING = CARD_WIDTH + MARGIN;
const DIVIDER_WIDTH = 5;

const CardRoller: React.FC<CardRollerProps> = ({ 
  cards, 
  targetIndex,
  duration = 8000 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTime = useRef<number>(0);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const currentPosition = useRef<number>(0);
  const velocity = useRef<number>(0);
  const targetPosition = useRef<number>(0);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const images = await Promise.all(
        cards.map(src => 
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
          })
        )
      );
      setLoadedImages(images);
    };

    loadImages();
  }, [cards]);

  // Canvas setup
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw divider
    // const centerX = ctx.canvas.width / (window.devicePixelRatio * 2);
    // ctx.fillStyle = '#d16266';
    // ctx.fillRect(centerX - DIVIDER_WIDTH/2, 0, DIVIDER_WIDTH, ctx.canvas.height);

    // Calculate visible cards
    const startIdx = Math.floor(-currentPosition.current / SPACING);
    const visibleCards = Math.ceil(ctx.canvas.width / SPACING) + 2;

    // Draw visible cards
    for (let i = startIdx; i < startIdx + visibleCards; i++) {
      const idx = (i % cards.length + cards.length) % cards.length;
      const x = currentPosition.current + i * SPACING;
      
      if (x > ctx.canvas.width) break;
      if (x + CARD_WIDTH < 0) continue;

      ctx.save();
      ctx.translate(x, 0);
      drawCard(ctx, loadedImages[idx]);
      ctx.restore();
    }
  }, [loadedImages, cards.length]);

  const drawCard = (ctx: CanvasRenderingContext2D, img?: HTMLImageElement) => {
    // Card background
    ctx.fillStyle = '#14202b';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    
    // Card image
    if (img) {
      ctx.drawImage(
        img,
        MARGIN,
        MARGIN,
        CARD_WIDTH - MARGIN*2,
        CARD_HEIGHT - MARGIN*2
      );
    }

    // Border
    ctx.strokeStyle = '#70677c';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CARD_WIDTH-1, CARD_HEIGHT-1);
  };

  const animate = useCallback((timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;

    if (targetIndex !== undefined && elapsed > duration * 0.2) {
      // Calculate target position
      const targetX = targetIndex * SPACING - (canvasRef.current!.width / (window.devicePixelRatio * 2)) + CARD_WIDTH/2;
      targetPosition.current = -targetX;
      
      // Smooth stopping
      velocity.current += (targetPosition.current - currentPosition.current) * 0.01;
      velocity.current *= 0.98;
      currentPosition.current += velocity.current;
      
      if (Math.abs(velocity.current) < 0.1) {
        currentPosition.current = targetPosition.current;
        setIsRolling(false);
      }
    } else {
      // Rolling animation
      const progress = Math.min(elapsed / duration, 1);
      currentPosition.current = -progress * (cards.length * SPACING * 2);
      velocity.current = -(cards.length * SPACING * 2) / duration;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      draw(ctx);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [duration, targetIndex, cards.length]);

  const startRoll = () => {
    if (!isRolling && loadedImages.length === cards.length) {
      setupCanvas();
      setIsRolling(true);
      startTime.current = 0;
      currentPosition.current = 0;
      velocity.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-64">
        {/* Enhanced vertical divider */}
      <div className="absolute left-1/2 h-full w-1 bg-[#d16266] z-[9998] shadow-xl" />
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      <button
        onClick={startRoll}
        disabled={isRolling || loadedImages.length !== cards.length}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {isRolling ? 'Rolling...' : 'Start Roll'}
      </button>
    </div>
  );
};

export default CardRoller;