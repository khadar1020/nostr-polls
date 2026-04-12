import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

interface Props {
  value: number | null; // 0–5 scale
  onChange: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  readOnly?: boolean;
  /** Require a hold gesture before touch interaction is accepted */
  requireHold?: boolean;
  /** Called when the hold lock state changes (true = locked) */
  onLockChange?: (locked: boolean) => void;
  size?: number; // star size in px
  /** Fill colour for lit stars */
  fillColor?: string;
}

const STARS = 5;
const STEP = 0.1;
const HOLD_MS = 400;

const TouchRating: React.FC<Props> = ({
  value,
  onChange,
  onChangeCommitted,
  readOnly = false,
  requireHold = false,
  onLockChange,
  size = 32,
  fillColor = "#FFB400",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [displayValue, setDisplayValue] = useState<number | null>(value);

  // Hold-to-unlock state (only relevant when requireHold=true)
  const [touchLocked, setTouchLocked] = useState(true);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTouchX = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging.current) setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    return () => { if (holdTimer.current) clearTimeout(holdTimer.current); };
  }, []);

  const unlock = useCallback(() => {
    setTouchLocked(false);
    onLockChange?.(false);
    navigator.vibrate?.(30);
    // Immediately start rating from the finger's current position
    if (activeTouchX.current !== null) {
      const v = computeValueFromX(activeTouchX.current);
      isDragging.current = true;
      setDisplayValue(v);
      onChange(v);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, onLockChange]);

  const computeValueFromX = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = ratio * STARS;
    const rounded = Math.round(raw / STEP) * STEP;
    return Math.max(0.5, Math.min(STARS, parseFloat(rounded.toFixed(1))));
  }, []);

  // ── Touch ────────────────────────────────────────────────────────────────
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (readOnly) return;
      e.stopPropagation();

      if (requireHold && touchLocked) {
        activeTouchX.current = e.touches[0].clientX;
        holdTimer.current = setTimeout(unlock, HOLD_MS);
        return;
      }

      isDragging.current = true;
      const v = computeValueFromX(e.touches[0].clientX);
      setDisplayValue(v);
      onChange(v);
    },
    [readOnly, requireHold, touchLocked, unlock, computeValueFromX, onChange]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (readOnly) return;
      e.stopPropagation();

      if (requireHold && touchLocked) {
        // Track position so unlock() can use it
        activeTouchX.current = e.touches[0].clientX;
        return;
      }

      if (!isDragging.current) return;
      const v = computeValueFromX(e.touches[0].clientX);
      setDisplayValue(v);
      onChange(v);
    },
    [readOnly, requireHold, touchLocked, computeValueFromX, onChange]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (readOnly) return;
      e.stopPropagation();

      if (holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      activeTouchX.current = null;

      if (requireHold && touchLocked) return; // hold was too short, ignore

      isDragging.current = false;
      if (displayValue != null) onChangeCommitted?.(displayValue);

      // Re-lock for next interaction
      if (requireHold) {
        setTouchLocked(true);
        onLockChange?.(true);
      }
    },
    [readOnly, requireHold, touchLocked, displayValue, onChangeCommitted, onLockChange]
  );

  // ── Mouse (desktop) ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      isDragging.current = true;
      const v = computeValueFromX(e.clientX);
      setDisplayValue(v);
      onChange(v);

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const next = computeValueFromX(ev.clientX);
        setDisplayValue(next);
        onChange(next);
      };

      const onMouseUp = (ev: MouseEvent) => {
        isDragging.current = false;
        const next = computeValueFromX(ev.clientX);
        setDisplayValue(next);
        onChangeCommitted?.(next);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [readOnly, computeValueFromX, onChange, onChangeCommitted]
  );

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      sx={{
        display: "inline-flex",
        gap: "3px",
        cursor: readOnly ? "default" : "pointer",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {Array.from({ length: STARS }, (_, i) => {
        const fill =
          displayValue != null
            ? Math.max(0, Math.min(1, displayValue - i))
            : 0;
        return (
          <Box
            key={i}
            sx={{
              position: "relative",
              width: size,
              height: size,
              flexShrink: 0,
            }}
          >
            <StarBorderRoundedIcon
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: size,
                height: size,
                color: "text.disabled",
                opacity: 0.4,
              }}
            />
            {fill > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${fill * 100}%`,
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <StarRoundedIcon
                  sx={{
                    width: size,
                    height: size,
                    color: fillColor,
                    filter: `drop-shadow(0 0 6px ${fillColor}88)`,
                  }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TouchRating;
