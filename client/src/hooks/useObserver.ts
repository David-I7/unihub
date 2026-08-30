import { useState, useRef, useCallback, useEffect } from "react";

export interface UseObserverOptions {
  /**
   * Callback fired when the target element enters the viewport / meets the threshold.
   */
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  /**
   * Callback fired when the target element leaves the viewport / ceases meeting the threshold.
   */
  onLeave?: (entry: IntersectionObserverEntry) => void;
  /**
   * Callback fired on any intersection state transition.
   */
  onChange?: (entry: IntersectionObserverEntry) => void;
  /**
   * Whether the observer is actively listening for intersections.
   * @default true
   */
  enabled?: boolean;
  /**
   * Disconnects the observer automatically after the first intersection event.
   * @default false
   */
  triggerOnce?: boolean;
  /**
   * The element that is used as the viewport for checking visibility of the target.
   * Defaults to the browser viewport if not specified or if null.
   */
  root?: Element | Document | null;
  /**
   * Margin around the root. Can have values similar to the CSS margin property.
   * @default "0px"
   */
  rootMargin?: string;
  /**
   * Either a single number or an array of numbers which indicate at what percentage
   * of the target's visibility the observer's callback should be executed.
   * @default 0
   */
  threshold?: number | number[];
}

export interface UseObserverReturn<T extends HTMLElement = HTMLElement> {
  /**
   * Callback ref to attach to the target DOM element.
   */
  ref: (node: T | null) => void;
  /**
   * True if the element is currently intersecting.
   */
  isIntersecting: boolean;
  /**
   * The most recent IntersectionObserverEntry.
   */
  entry: IntersectionObserverEntry | null;
}

export function useObserver<T extends HTMLElement = HTMLElement>({
  onIntersect,
  onLeave,
  onChange,
  enabled = true,
  triggerOnce = false,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseObserverOptions = {}): UseObserverReturn<T> {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const targetNodeRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep latest callbacks in ref to avoid recreating IntersectionObserver on inline function changes
  const callbacksRef = useRef({ onIntersect, onLeave, onChange });
  useEffect(() => {
    callbacksRef.current = { onIntersect, onLeave, onChange };
  });

  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const attachObserver = useCallback(() => {
    cleanupObserver();

    if (!enabled || typeof IntersectionObserver === "undefined" || !targetNodeRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([latestEntry]) => {
        if (!latestEntry) return;

        const isCurrentlyIntersecting = latestEntry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);
        setEntry(latestEntry);

        callbacksRef.current.onChange?.(latestEntry);

        if (isCurrentlyIntersecting) {
          callbacksRef.current.onIntersect?.(latestEntry);
          if (triggerOnce) {
            cleanupObserver();
          }
        } else {
          callbacksRef.current.onLeave?.(latestEntry);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(targetNodeRef.current);
    observerRef.current = observer;
  }, [enabled, triggerOnce, root, rootMargin, threshold, cleanupObserver]);

  // Re-attach observer if dependencies change
  useEffect(() => {
    attachObserver();
    return cleanupObserver;
  }, [attachObserver, cleanupObserver]);

  const ref = useCallback(
    (node: T | null) => {
      if (targetNodeRef.current !== node) {
        targetNodeRef.current = node;
        attachObserver();
      }
    },
    [attachObserver],
  );

  return {
    ref,
    isIntersecting,
    entry,
  };
}
