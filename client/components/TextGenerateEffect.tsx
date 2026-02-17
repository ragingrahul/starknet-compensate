"use client";
import { useEffect, useMemo, memo } from "react";
import { useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = memo(
  ({
    words,
    className,
    filter = true,
    duration = 0.5,
    delay = 0.8,
  }: {
    words: string;
    className?: string;
    filter?: boolean;
    duration?: number;
    delay?: number;
  }) => {
    const [scope, animate] = useAnimate();
    const wordsArray = useMemo(() => words?.split(" ") || [], [words]);

    useEffect(() => {
      let isMounted = true;

      const startAnimation = async () => {
        if (!isMounted || !scope.current) return;

        const spans = Array.from(
          scope.current.querySelectorAll("span")
        ) as HTMLSpanElement[];

        spans.forEach((span: HTMLSpanElement) => {
          span.style.willChange = "opacity, filter";
          span.style.backfaceVisibility = "hidden";
        });

        const staggerDelay = 0.03;

        await animate(
          spans,
          {
            opacity: 1,
            filter: filter ? "blur(0px)" : "none",
          },
          {
            duration: duration,
            delay: (i: number) => delay + i * staggerDelay,
            ease: [0.22, 1, 0.36, 1],
          }
        );
      };

      startAnimation();

      return () => {
        isMounted = false;
      };
    }, [animate, duration, filter, delay, scope]);

    const renderWords = useMemo(() => {
      return (
        <div ref={scope}>
          {wordsArray.map((word, idx) => (
            <span
              key={`${word}-${idx}`}
              style={{
                opacity: 0,
                filter: filter ? "blur(4px)" : "none",
                display: "inline-block",
                transform: "translateZ(0)",
              }}
            >
              {word}{" "}
            </span>
          ))}
        </div>
      );
    }, [wordsArray, filter, scope]);

    return (
      <div className={cn("font-bold", className)}>
        <div className="my-4">
          <div
            className="leading-snug tracking-wide"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            {renderWords}
          </div>
        </div>
      </div>
    );
  }
);

TextGenerateEffect.displayName = "TextGenerateEffect";
