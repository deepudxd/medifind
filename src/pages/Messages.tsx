import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import MessagingPanel from '@/components/MessagingPanel';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMessagesForUser } from '@/lib/api';

const Messages = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['messages', user.id],
        queryFn: () => getMessagesForUser(user.id),
        enabled: !!user.id,
        refetchInterval: 5000
    });

    return (
        <div className="container py-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
                    <p className="text-sm text-muted-foreground">Communicate with your doctors</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <MessagingPanel
                    currentUserId={user.id}
                    currentUserName={user.name}
                    conversations={conversations}
                />
            )}
        </div>
    );
};

export default Messages;
