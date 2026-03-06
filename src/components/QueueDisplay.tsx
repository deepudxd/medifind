import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

interface QueueDisplayProps {
    queueNumber: number;
    totalInQueue: number;
    estimatedWaitMinutes?: number;
}

const QueueDisplay = ({ queueNumber, totalInQueue, estimatedWaitMinutes }: QueueDisplayProps) => {
    const ahead = totalInQueue - queueNumber;
    const wait = estimatedWaitMinutes ?? ahead * 15;

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-primary">Your Queue Number</p>
                        <p className="font-display text-4xl font-bold text-primary mt-1"># {queueNumber}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{ahead > 0 ? `${ahead} ahead of you` : 'You\'re next!'}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>~{wait} min wait</span>
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex gap-1">
                    {Array.from({ length: totalInQueue }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${i < queueNumber ? 'bg-primary' : 'bg-primary/20'}`}
                        />
                    ))}
                </div>
                {ahead === 0 && (
                    <Badge className="mt-3 bg-success text-success-foreground">You're next — please be ready!</Badge>
                )}
            </CardContent>
        </Card>
    );
};

export default QueueDisplay;
