import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
} from "@mui/material";
import SwipeIcon from "@mui/icons-material/SwipeRounded";
import { useRating } from "../../hooks/useRating";
import TouchRating from "./TouchRating";

interface Props {
  entityId: string;
  entityType?: string;
}

const Rate: React.FC<Props> = ({ entityId, entityType = "event" }) => {
  const ratingKey = `${entityType}:${entityId}`;
  const { averageRating, totalRatings, submitRating, getUserRating } =
    useRating(ratingKey);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [showContentInput, setShowContentInput] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const userRating = getUserRating(ratingKey);

  useEffect(() => {
    if (userRating) {
      setRatingValue(userRating * 5);
    }
  }, [userRating]);

  const handleChange = (newValue: number) => {
    setRatingValue(newValue);
    setIsDragging(true);
    setError("");
  };

  const handleChangeCommitted = (newValue: number) => {
    setIsDragging(false);
    setRatingValue(newValue);
    setError("");
    if (!showContentInput) {
      submitRating(newValue, 5, entityType);
    }
  };

  const handleSubmit = () => {
    if (ratingValue === null) {
      setError("Please give a rating before submitting a review.");
      return;
    }
    setError("");
    submitRating(ratingValue, 5, entityType, content);
    setShowContentInput(false);
  };

  const displayedAvg = averageRating ? (averageRating * 5).toFixed(1) : null;

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      {/* Stars + live value */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <TouchRating
          value={ratingValue ?? (averageRating ? averageRating * 5 : null)}
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          size={34}
        />

        {/* Numeric value — live during drag */}
        {(ratingValue != null || displayedAvg != null) && (
          <Chip
            label={
              isDragging && ratingValue != null
                ? ratingValue.toFixed(1)
                : ratingValue != null
                ? ratingValue.toFixed(1)
                : displayedAvg
            }
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.85rem",
              bgcolor: isDragging ? "warning.main" : "action.selected",
              color: isDragging ? "warning.contrastText" : "text.primary",
              transition: "background-color 0.15s",
              minWidth: 44,
            }}
          />
        )}
      </Box>

      {/* Drag hint — only when no rating set yet */}
      {ratingValue === null && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <SwipeIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled">
            Tap or drag for precision
          </Typography>
        </Box>
      )}

      {/* Community average */}
      {totalRatings ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          Community avg: {displayedAvg} ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})
        </Typography>
      ) : null}

      {/* Review CTA */}
      {!showContentInput && (
        <Button
          variant="text"
          size="small"
          sx={{ mt: 0.5, px: 0, color: "text.secondary", fontSize: "0.75rem" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowContentInput(true);
          }}
        >
          Add a written review?
        </Button>
      )}

      {/* Review input */}
      {showContentInput && (
        <>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Your Review"
            value={content}
            onChange={(e) => {
              e.stopPropagation();
              setContent(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{ mt: 1.5 }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
          >
            Submit Review
          </Button>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Rate;
