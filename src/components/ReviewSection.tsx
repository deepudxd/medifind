import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReview } from '@/lib/api';
import type { Review } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
    doctorId: string;
    rating: number;
    reviewCount: number;
    reviews: Review[];
}

const ReviewSection = ({ doctorId, rating, reviewCount, reviews }: ReviewSectionProps) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const doctorReviews = reviews.filter(r => r.doctor_id === doctorId);

    const [showForm, setShowForm] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: doctorReviews.filter(r => Math.floor(r.rating) === stars).length,
        pct: doctorReviews.length > 0
            ? Math.round((doctorReviews.filter(r => Math.floor(r.rating) === stars).length / doctorReviews.length) * 100)
            : 0,
    }));

    const reviewMutation = useMutation({
        mutationFn: submitReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', doctorId] });
            toast.success('Review submitted successfully!');
            setShowForm(false);
            setSelectedRating(0);
            setReviewText('');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to submit review');
        }
    });

    const handleSubmit = () => {
        if (!isAuthenticated || !user) {
            toast.error('Please login to leave a review');
            return;
        }
        if (selectedRating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!reviewText.trim()) {
            toast.error('Please write a review');
            return;
        }
        reviewMutation.mutate({
            patient_id: user.id,
            doctor_id: doctorId,
            rating: selectedRating,
            review: reviewText.trim()
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg">Patient Reviews</CardTitle>
                    {isAuthenticated && user?.role === 'patient' && !showForm && (
                        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                            Write a Review
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Submit Review Form */}
                {showForm && (
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                        <p className="font-medium text-sm text-foreground">Your Rating</p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'h-6 w-6 cursor-pointer transition-colors',
                                        (hoverRating || selectedRating) >= star
                                            ? 'text-warning fill-warning'
                                            : 'text-muted-foreground/30'
                                    )}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setSelectedRating(star)}
                                />
                            ))}
                            {selectedRating > 0 && (
                                <span className="ml-2 text-sm text-muted-foreground">{selectedRating}/5</span>
                            )}
                        </div>
                        <Textarea
                            placeholder="Share your experience with this doctor..."
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            rows={3}
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                disabled={reviewMutation.isPending}
                                onClick={handleSubmit}
                            >
                                {reviewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit Review
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setSelectedRating(0); setReviewText(''); }}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="flex gap-6 rounded-xl bg-muted/40 p-4">
                    <div className="text-center">
                        <p className="font-display text-4xl font-bold text-foreground">{rating.toFixed(1)}</p>
                        <StarRating rating={rating} size="md" />
                        <p className="mt-1 text-xs text-muted-foreground">{reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                        {ratingCounts.map(({ stars, count, pct }) => (
                            <div key={stars} className="flex items-center gap-2 text-xs">
                                <span className="w-3 shrink-0 text-muted-foreground">{stars}</span>
                                <Progress value={pct} className="h-2 flex-1" />
                                <span className="w-6 text-right text-muted-foreground">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review list */}
                {doctorReviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="space-y-3">
                        {doctorReviews.map(r => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </div>
                )}

                {doctorReviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">Verified patients only</Badge>
                        <Badge variant="secondary" className="text-success border-success/30 bg-success/5">
                            {Math.round((doctorReviews.filter(r => r.rating >= 4).length / doctorReviews.length) * 100)}% positive
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewSection;
