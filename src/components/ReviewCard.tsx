import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Review } from '@/types';
import StarRating from './StarRating';
import { format } from 'date-fns';

interface ReviewCardProps {
    review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                        {review.patient_name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{review.patient_name}</p>
                        <p className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.review}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default ReviewCard;
