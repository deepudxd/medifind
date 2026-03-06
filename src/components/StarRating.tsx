import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
}

const StarRating = ({ rating, max = 5, size = 'md', showValue = false }: StarRatingProps) => {
    const sizeClass = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size];

    return (
        <span className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => {
                const filled = i + 1 <= Math.floor(rating);
                const partial = !filled && i < rating;
                return (
                    <Star
                        key={i}
                        className={cn(sizeClass, 'text-warning', filled || partial ? 'fill-warning' : 'fill-transparent')}
                    />
                );
            })}
            {showValue && <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>}
        </span>
    );
};

export default StarRating;
