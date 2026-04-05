import React, { useRef, useState, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

interface Props {
  value: number | null; // 0–5 scale
  onChange: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  readOnly?: boolean;
  size?: number; // star size in px
}

const STARS = 5;
const STEP = 0.1;

const TouchRating: React.FC<Props> = ({
  value,
  onChange,
  onChangeCommitted,
  readOnly = false,
  size = 32,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [displayValue, setDisplayValue] = useState<number | null>(value);

  useEffect(() => {
    if (!isDragging.current) setDisplayValue(value);
  }, [value]);

  const computeValue = useCallback((clientX: number): number => {
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
      isDragging.current = true;
      const v = computeValue(e.touches[0].clientX);
      setDisplayValue(v);
      onChange(v);
    },
    [readOnly, computeValue, onChange]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (readOnly || !isDragging.current) return;
      e.stopPropagation();
      const v = computeValue(e.touches[0].clientX);
      setDisplayValue(v);
      onChange(v);
    },
    [readOnly, computeValue, onChange]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (readOnly) return;
      e.stopPropagation();
      isDragging.current = false;
      if (displayValue != null) onChangeCommitted?.(displayValue);
    },
    [readOnly, displayValue, onChangeCommitted]
  );

  // ── Mouse (desktop) ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      e.preventDefault();
      isDragging.current = true;
      const v = computeValue(e.clientX);
      setDisplayValue(v);
      onChange(v);

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const next = computeValue(ev.clientX);
        setDisplayValue(next);
        onChange(next);
      };

      const onMouseUp = (ev: MouseEvent) => {
        isDragging.current = false;
        const next = computeValue(ev.clientX);
        setDisplayValue(next);
        onChangeCommitted?.(next);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [readOnly, computeValue, onChange, onChangeCommitted]
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
                    color: "#FFB400",
                    filter: "drop-shadow(0 0 6px rgba(255,180,0,0.55))",
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
