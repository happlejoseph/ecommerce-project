import { useState } from "react";
import { FiStar } from "react-icons/fi";

// Works two ways:
// - Read-only display:  <StarRating rating={4.3} readOnly />
// - Interactive input:  <StarRating rating={rating} onChange={setRating} />
const StarRating = ({ rating = 0, onChange, readOnly = false, size = 18 }) => {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <FiStar
            size={size}
            className={
              star <= Math.round(displayRating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
