import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import StarRating from "./StarRating";

const ReviewsSection = ({ productId, averageRating = 0, numReviews = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const fetchMyReview = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get(`/reviews/product/${productId}/mine`);
      setMyReview(response.data.review);
    } catch (error) {
      console.error("Failed to fetch your review:", error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchReviews(), fetchMyReview()]);
      setLoading(false);
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated]);

  const openWriteForm = () => {
    setFormRating(0);
    setFormComment("");
    setShowForm(true);
  };

  const openEditForm = () => {
    setFormRating(myReview.rating);
    setFormComment(myReview.comment);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (formRating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    if (!formComment.trim()) {
      showToast("Please write a review", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (myReview) {
        // editing an existing review
        await api.put(`/reviews/${myReview._id}`, {
          rating: formRating,
          comment: formComment,
        });
        showToast("Review updated", "success");
      } else {
        // adding a new review
        await api.post("/reviews", {
          productId,
          rating: formRating,
          comment: formComment,
        });
        showToast("Review submitted", "success");
      }

      setShowForm(false);
      await Promise.all([fetchReviews(), fetchMyReview()]);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit review",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setDeletingId(reviewId);

    try {
      await api.delete(`/reviews/${reviewId}`);
      showToast("Review deleted", "success");
      setMyReview(null);
      await fetchReviews();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete review",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="text-xl font-bold">Ratings & Reviews</h2>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-3">
        <StarRating rating={averageRating} readOnly size={20} />
        <span className="text-sm font-semibold">
          {averageRating > 0 ? averageRating.toFixed(1) : "No ratings yet"}
        </span>
        <span className="text-sm text-gray-400">
          ({numReviews} {numReviews === 1 ? "review" : "reviews"})
        </span>
      </div>

      {/* Write / Edit trigger */}
      {isAuthenticated && !showForm && (
        <button
          onClick={myReview ? openEditForm : openWriteForm}
          className="mt-5 rounded-lg border border-black px-5 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
        >
          {myReview ? "Edit Your Review" : "Write a Review"}
        </button>
      )}

      {!isAuthenticated && (
        <p className="mt-5 text-sm text-gray-500">
          Please log in to write a review.
        </p>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mt-5 rounded-xl border border-gray-200 p-6">
          <p className="mb-2 text-sm font-medium">Your Rating</p>
          <StarRating rating={formRating} onChange={setFormRating} size={24} />

          <p className="mb-2 mt-4 text-sm font-medium">Your Review</p>
          <textarea
            value={formComment}
            onChange={(event) => setFormComment(event.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="mt-8 space-y-6">
        {loading && (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-sm text-gray-400">
            No reviews yet. Be the first to review this product.
          </p>
        )}

        {!loading &&
          reviews.map((review) => {
            const isOwnReview = user?.id === review.user?._id;

            return (
              <div
                key={review._id}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {review.user?.name || "Anonymous"}
                      {isOwnReview && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          (You)
                        </span>
                      )}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} readOnly size={14} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {isOwnReview && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openEditForm}
                        aria-label="Edit review"
                        className="text-gray-400 transition hover:text-black"
                      >
                        <FiEdit2 size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deletingId === review._id}
                        aria-label="Delete review"
                        className="text-gray-400 transition hover:text-red-600 disabled:opacity-50"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ReviewsSection;
