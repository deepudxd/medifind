import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import type { Conversation, Message } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, markMessagesAsRead } from '@/lib/api';

interface MessagingPanelProps {
    currentUserId: string;
    currentUserName: string;
    conversations: Conversation[];
}

const MessagingPanel = ({ currentUserId, currentUserName, conversations }: MessagingPanelProps) => {
    const queryClient = useQueryClient();
    const [selectedConvId, setSelectedConvId] = useState<string | null>(conversations[0]?.id ?? null);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

    useEffect(() => {
        if (!selectedConvId && conversations.length > 0) {
            setSelectedConvId(conversations[0].id);
        }
    }, [conversations, selectedConvId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConv?.messages.length]);

    useEffect(() => {
        if (selectedConv && selectedConv.unread_count > 0) {
            markMessagesAsRead(currentUserId, selectedConv.participant_id).then(() => {
                queryClient.invalidateQueries({ queryKey: ['messages', currentUserId] });
            });
        }
    }, [selectedConv, currentUserId, queryClient]);

    const sendMsgMutation = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', currentUserId] });
            setInput('');
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedConv) return;
        sendMsgMutation.mutate({
            sender_id: currentUserId,
            receiver_id: selectedConv.participant_id,
            message: input.trim()
        });
    };

    if (conversations.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Your conversations will appear here after you book appointments.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr]" style={{ minHeight: 480 }}>
                {/* Sidebar */}
                <div className="border-r">
                    <div className="border-b p-4">
                        <p className="font-display font-semibold text-foreground">Messages</p>
                    </div>
                    <div className="divide-y">
                        {conversations.map(conv => (
                            <button
                                key={conv.id}
                                className={cn(
                                    'w-full p-4 text-left transition-colors hover:bg-muted/50',
                                    selectedConvId === conv.id && 'bg-primary/5'
                                )}
                                onClick={() => setSelectedConvId(conv.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            {conv.participant_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-foreground truncate">{conv.participant_name}</p>
                                            {conv.unread_count > 0 && (
                                                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                                    {conv.unread_count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat area */}
                {selectedConv ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 border-b p-4">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {selectedConv.participant_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-foreground text-sm">{selectedConv.participant_name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{selectedConv.participant_role}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 340 }}>
                            {selectedConv.messages.map(msg => {
                                const isMe = msg.sender_id === currentUserId;
                                return (
                                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                                        <div
                                            className={cn(
                                                'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                                                isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'bg-muted text-foreground rounded-tl-sm'
                                            )}
                                        >
                                            <p>{msg.message}</p>
                                            <p className={cn('mt-1 text-[10px]', isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground')}>
                                                {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={endRef} />
                        </div>

                        <form onSubmit={handleSend} className="flex gap-2 border-t p-4">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1"
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || sendMsgMutation.isPending}>
                                {sendMsgMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-muted-foreground">
                        Select a conversation
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MessagingPanel;
