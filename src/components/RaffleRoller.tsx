// CardRoller.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle
} from 'react';

interface CardRollerProps {
  ref: React.RefObject<any>;
  cards: string[];
  targetIndex?: number;
  duration?: number;
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 120;
const MARGIN = 10;
const SPACING = CARD_WIDTH + MARGIN;

// Ease-out quadratic easing function
const easeOutQuad = (t: number): number => t * (2 - t);

const CardRoller: React.FC<CardRollerProps> = ({
  cards,
  targetIndex = 0,
  ref,
  duration = 6000
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTime = useRef<number>(0);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const currentPosition = useRef<number>(0);
  const targetPosition = useRef<number>(0);
  const initialPosition = useRef<number>(0);

  cards = Array.from({ length: 20 }, () => cards).flat();

  // Expose roll() method to parent
  useImperativeHandle(ref, () => ({
    roll: () => {
      startRoll();
    },
    isRolling: () => isRolling
  }));

  // Preload images
  useEffect(() => {
    let isCancelled = false; // cancellation flag

    const loadImages = async () => {
      console.log("Loading images...");
      const images = await Promise.all(
        cards.map(src =>
          new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            // In case of an error, resolve so the animation can continue
            img.onerror = () => resolve(img);
          })
        )
      );
      if (!isCancelled) {
        setLoadedImages(images);
      }
    };

    loadImages();

    // Cleanup function sets the flag to true on unmount
    return () => {
      isCancelled = true;
    };
  }, []);

  // Setup canvas with device pixel ratio support
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

  // Draw the cards on the canvas.
  // When rolling, no card is highlighted.
  // Once finished, only the finishing card (normalized targetIndex) is drawn white.
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Normalize the target index to be within the array bounds
    const normalizedTargetIndex = ((targetIndex % cards.length) + cards.length) % cards.length;
    const startIdx = Math.floor(-currentPosition.current / SPACING);
    const visibleCards = Math.ceil(ctx.canvas.width / SPACING) + 2;
    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    for (let i = startIdx; i < startIdx + visibleCards; i++) {
      const idx = ((i % cards.length) + cards.length) % cards.length;
      const x = currentPosition.current + i * SPACING;
      if (x > canvasWidth) break;
      if (x + CARD_WIDTH < 0) continue;
      // Only highlight when not rolling and this card is the target.
      const chosenOne = (!isRolling && idx === normalizedTargetIndex);
      ctx.save();
      ctx.translate(x, 0);
      drawCard(ctx, loadedImages[idx], chosenOne);
      ctx.restore();
    }
  }, [loadedImages, cards.length, targetIndex, isRolling]);

  const drawCard = (
    ctx: CanvasRenderingContext2D,
    img?: HTMLImageElement,
    chosenOne = false
  ) => {
    ctx.fillStyle = chosenOne ? '#468847' : '#14202b';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    if (img) {
      ctx.drawImage(
        img,
        MARGIN,
        MARGIN,
        CARD_WIDTH - MARGIN * 2,
        CARD_HEIGHT - MARGIN * 2
      );
    }
    ctx.strokeStyle = '#70677c';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1);
  };

  // Animation loop using an easing function
  const animate = useCallback((timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const elapsed = timestamp - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuad(progress);

    currentPosition.current =
      initialPosition.current +
      (targetPosition.current - initialPosition.current) * easedProgress;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx);
      }
    }
    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsRolling(false);
    }
  }, [duration, draw]);

  // Start the roll animation
  const startRoll = () => {
    if (!isRolling && loadedImages.length === cards.length) {
      setupCanvas();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();

      // Compute the target position so the target card is centered.
      const computedTarget =
        canvasRect.width / 2 - CARD_WIDTH / 2 - targetIndex * SPACING;
      targetPosition.current = computedTarget;
      // For right-to-left, start far to the right of the target
      initialPosition.current = computedTarget + cards.length * SPACING * 2;
      currentPosition.current = initialPosition.current;
      setIsRolling(true);
      startTime.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-30">
      {/* Divider at the center */}
      <div className="absolute left-1/2 h-full w-1 bg-[#d16266] z-[9998] shadow-xl" />
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default CardRoller;
