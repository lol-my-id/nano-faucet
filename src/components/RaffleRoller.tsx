"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { REEL_TIER_COUNT, reelTierFilter } from "../modules/utils";

export interface RaffleRollerHandle {
  /** Start the reel spinning. Returns false if a spin is already running. */
  start: () => boolean;
  /** Decelerate onto a reward tier (0 = smallest, last = top prize). */
  land: (tier: number) => Promise<boolean>;
  /** Stop immediately and return to the idle position. */
  reset: () => void;
  isRolling: () => boolean;
}

interface RaffleRollerProps {
  ref?: React.Ref<RaffleRollerHandle>;
  cards: string[];
}

interface ReelLayout {
  width: number;
  card: number;
  gap: number;
}

interface LandingAnimation {
  startIndex: number;
  targetIndex: number;
  duration: number;
  elapsed: number;
  startSpeed: number;
}

type ReelMode = "idle" | "spinning" | "landing" | "done";

const REPEATS = 24;
const DEFAULT_LAYOUT: ReelLayout = { width: 0, card: 112, gap: 11 };
const SPIN_SPEED_PX = 1050;
const MIN_SPIN_MS = 900;
const LAND_DURATION_MS = 1800;

/**
 * Responsive, DOM-based reward reel.
 *
 * Sizing and positioning are measured from the container and re-applied on
 * resize, so the reel stays aligned at any viewport size or browser zoom.
 * The spin runs in index space rather than pixels, which means a resize in
 * the middle of a spin (or while the payout is being prepared) cannot break
 * the final centering.
 */
const RaffleRoller: React.FC<RaffleRollerProps> = ({ cards, ref }) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<ReelLayout>(DEFAULT_LAYOUT);
  const modeRef = useRef<ReelMode>("idle");
  const spinIndexRef = useRef(0);
  const spinElapsedRef = useRef(0);
  const lastFrameRef = useRef(0);
  const pendingTierRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const landResolveRef = useRef<((value: boolean) => void) | null>(null);
  const landingRef = useRef<LandingAnimation>({
    startIndex: 0,
    targetIndex: 0,
    duration: LAND_DURATION_MS,
    elapsed: 0,
    startSpeed: 8,
  });

  const [layout, setLayout] = useState<ReelLayout>(DEFAULT_LAYOUT);
  const [ready, setReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);

  const sourceKey = cards.join("|");
  const sources = useMemo(
    () => (sourceKey.length > 0 ? sourceKey.split("|") : [""]),
    [sourceKey]
  );

  // A full deck contains one card per payout tier. The same currency image is
  // used for every card, filtered from dim grey up to the real Nano colour.
  const deck = useMemo(
    () =>
      Array.from({ length: REEL_TIER_COUNT }, (_, tier) => ({
        src: sources[tier % sources.length] ?? "",
        tier,
      })),
    [sources]
  );
  const deckLength = deck.length;

  const items = useMemo(
    () => Array.from({ length: REPEATS }, () => deck).flat(),
    [deck]
  );

  const centerIndex = Math.floor(REPEATS / 2) * deckLength + Math.floor(deckLength / 2);

  const restIndexRef = useRef(centerIndex);

  const applyIndex = useCallback((index: number) => {
    const live = layoutRef.current;
    const x = live.width / 2 - live.card / 2 - index * (live.card + live.gap);
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
  }, []);

  const measure = useCallback((): ReelLayout | null => {
    const shell = shellRef.current;
    if (!shell) return null;

    const rect = shell.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;

    // Exclude the 1px border: the track is positioned inside it, while the
    // center marker is laid out against the same inner box.
    const width = rect.width - shell.clientLeft * 2;
    const height = rect.height - shell.clientTop * 2;
    // Match the browser's common 1/64px layout unit. Without this, the card
    // width used for the math and the width actually rendered can drift by a
    // sub-pixel per card, which adds up by the winning position.
    const rawCard = Math.max(64, Math.min(height - 24, width * 0.3, 136));
    const card = Math.round(rawCard * 64) / 64;
    const gap = Math.max(8, Math.round(card * 0.1));
    const next = { width, card, gap };
    const previous = layoutRef.current;

    if (
      Math.abs(previous.width - next.width) > 0.5 ||
      Math.abs(previous.card - next.card) > 0.5
    ) {
      layoutRef.current = next;
      setLayout(next);
    }

    const mode = modeRef.current;
    if (mode === "idle" || mode === "done") {
      applyIndex(restIndexRef.current);
    }

    setReady(true);
    return next;
  }, [applyIndex]);

  useLayoutEffect(() => {
    measure();

    const shell = shellRef.current;
    if (!shell) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(shell);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [measure]);

  // Keep the resting card centered when the container is resized or a new
  // deck (currency) is rendered.
  useLayoutEffect(() => {
    const mode = modeRef.current;
    if (mode === "idle" || mode === "done") {
      applyIndex(restIndexRef.current);
    }
  }, [layout, deckLength, applyIndex]);

  useEffect(() => {
    if (modeRef.current === "idle" || modeRef.current === "done") {
      restIndexRef.current = centerIndex;
      setLandedIndex(null);
      applyIndex(centerIndex);
    }
  }, [centerIndex, applyIndex]);

  const getSpinSpeed = useCallback(() => {
    const live = layoutRef.current;
    const step = Math.max(1, live.card + live.gap);
    return Math.max(7, Math.min(15, SPIN_SPEED_PX / step));
  }, []);

  const finishLanding = useCallback(() => {
    modeRef.current = "done";
    setIsRolling(false);

    const target = landingRef.current.targetIndex;
    restIndexRef.current = target;
    setLandedIndex(target);
    applyIndex(target);

    const resolve = landResolveRef.current;
    landResolveRef.current = null;
    resolve?.(true);
  }, [applyIndex]);

  const landFrame = useCallback(
    (timestamp: number) => {
      if (modeRef.current !== "landing") return;

      const animation = landingRef.current;
      const delta = Math.min(0.05, (timestamp - lastFrameRef.current) / 1000);
      lastFrameRef.current = timestamp;
      animation.elapsed += delta * 1000;

      const t = Math.min(animation.elapsed / animation.duration, 1);
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;

      // Hermite curve: starts at the current spin speed and eases to zero.
      const index =
        h00 * animation.startIndex +
        h10 * (animation.duration / 1000) * animation.startSpeed +
        h01 * animation.targetIndex;

      applyIndex(index);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(landFrame);
      } else {
        finishLanding();
      }
    },
    [applyIndex, finishLanding]
  );

  const beginLanding = useCallback(
    (tier: number) => {
      if (modeRef.current !== "spinning") return;

      modeRef.current = "landing";
      const startIndex = spinIndexRef.current;
      const speed = getSpinSpeed();
      const desiredIndex = startIndex + (speed * (LAND_DURATION_MS / 1000)) / 2;

      // Pick the occurrence of the requested tier closest to the desired
      // landing distance. A full deck is five cards, so the search window
      // always contains one of each tier. The minimum distance keeps the
      // landing slow enough to read at higher spin speeds.
      let targetIndex: number | null = null;
      let bestDistance = Infinity;
      const minDistance = Math.max(3, speed * 0.7);
      const from = Math.ceil(startIndex + minDistance);
      const maxIndex = items.length - deckLength - 1;
      const to = Math.min(Math.ceil(desiredIndex + deckLength), maxIndex);

      for (let candidate = from; candidate <= to; candidate++) {
        if (candidate % deckLength !== tier) continue;
        const distance = Math.abs(candidate - desiredIndex);
        if (distance < bestDistance) {
          bestDistance = distance;
          targetIndex = candidate;
        }
      }

      if (targetIndex === null) {
        finishLanding();
        return;
      }

      const distance = Math.max(0.001, targetIndex - startIndex);
      const duration = Math.max(700, Math.min(3200, (2 * distance * 1000) / speed));

      landingRef.current = {
        startIndex,
        targetIndex,
        duration,
        elapsed: 0,
        startSpeed: speed,
      };

      lastFrameRef.current = performance.now();
      rafRef.current = requestAnimationFrame(landFrame);
    },
    [deckLength, finishLanding, getSpinSpeed, items.length, landFrame]
  );

  const spinFrame = useCallback(
    (timestamp: number) => {
      if (modeRef.current !== "spinning") return;

      const delta = Math.min(0.05, (timestamp - lastFrameRef.current) / 1000);
      lastFrameRef.current = timestamp;
      spinElapsedRef.current += delta * 1000;

      spinIndexRef.current += getSpinSpeed() * delta;
      if (spinIndexRef.current >= centerIndex + deckLength) {
        spinIndexRef.current -= deckLength;
      }

      applyIndex(spinIndexRef.current);

      const pendingTier = pendingTierRef.current;
      if (pendingTier !== null && spinElapsedRef.current >= MIN_SPIN_MS) {
        pendingTierRef.current = null;
        beginLanding(pendingTier);
        return;
      }

      rafRef.current = requestAnimationFrame(spinFrame);
    },
    [applyIndex, beginLanding, centerIndex, deckLength, getSpinSpeed]
  );

  const start = useCallback(() => {
    if (modeRef.current === "spinning" || modeRef.current === "landing") {
      return false;
    }

    cancelAnimationFrame(rafRef.current);
    modeRef.current = "spinning";
    setIsRolling(true);
    setLandedIndex(null);

    spinIndexRef.current = centerIndex;
    spinElapsedRef.current = 0;
    pendingTierRef.current = null;
    restIndexRef.current = centerIndex;
    applyIndex(centerIndex);

    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(spinFrame);
    return true;
  }, [applyIndex, centerIndex, spinFrame]);

  const land = useCallback(
    (tier: number) => {
      const normalizedTier =
        ((Math.round(tier) % deckLength) + deckLength) % deckLength;

      if (modeRef.current === "landing" || modeRef.current === "done") {
        return Promise.resolve(false);
      }

      return new Promise<boolean>((resolve) => {
        landResolveRef.current?.(false);
        landResolveRef.current = resolve;

        if (modeRef.current === "idle") {
          start();
        }

        if (modeRef.current !== "spinning") {
          landResolveRef.current = null;
          resolve(false);
          return;
        }

        if (spinElapsedRef.current >= MIN_SPIN_MS) {
          pendingTierRef.current = null;
          beginLanding(normalizedTier);
        } else {
          pendingTierRef.current = normalizedTier;
        }
      });
    },
    [beginLanding, deckLength, start]
  );

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    modeRef.current = "idle";
    pendingTierRef.current = null;
    setIsRolling(false);
    setLandedIndex(null);
    restIndexRef.current = centerIndex;
    applyIndex(centerIndex);

    const resolve = landResolveRef.current;
    landResolveRef.current = null;
    resolve?.(false);
  }, [applyIndex, centerIndex]);

  useImperativeHandle(
    ref,
    () => ({
      start,
      land,
      reset,
      isRolling: () =>
        modeRef.current === "spinning" || modeRef.current === "landing",
    }),
    [start, land, reset]
  );

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      modeRef.current = "idle";
      const resolve = landResolveRef.current;
      landResolveRef.current = null;
      resolve?.(false);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className={`reel-shell relative h-36 w-full overflow-hidden rounded-lg border border-white/[0.08] transition-opacity duration-150 sm:h-44 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div className="reel-track-mask relative z-10 h-full overflow-hidden">
        <div
          ref={trackRef}
          className="relative flex h-full items-center will-change-transform"
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={`reel-card shrink-0 rounded-lg p-2 ${
                landedIndex !== null && index === landedIndex
                  ? "reel-card--winner"
                  : ""
              }`}
              style={{
                width: layout.card,
                height: layout.card,
                marginRight: layout.gap,
              }}
            >
              {item.src ? (
                <img
                  src={item.src}
                  alt=""
                  className="h-full w-full rounded-md object-contain"
                  style={{ filter: reelTierFilter(item.tier) }}
                  draggable={false}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1.5 z-30 h-2.5 w-4 -translate-x-1/2 bg-primary [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-2.5 w-4 -translate-x-1/2 rotate-180 bg-primary [clip-path:polygon(0_0,100%_0,50%_100%)]" />

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-[10px] border ${
          isRolling ? "border-primary/60" : "border-white/20"
        }`}
        style={{ width: layout.card + 14, height: layout.card + 14 }}
      />
    </div>
  );
};

export default RaffleRoller;
