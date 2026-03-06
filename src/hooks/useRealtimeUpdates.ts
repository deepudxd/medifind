import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Subscribes to Supabase Realtime changes on the given tables
 * and auto-invalidates the matching React Query caches.
 *
 * Usage:  useRealtimeUpdates(['appointments', 'reviews', 'doctors']);
 */

type TableConfig = {
    table: string;
    queryKeys: string[][];  // React Query keys to invalidate
};

const TABLE_MAP: Record<string, TableConfig> = {
    appointments: {
        table: 'appointments',
        queryKeys: [['appointments'], ['token-count']],
    },
    reviews: {
        table: 'reviews',
        queryKeys: [['reviews']],
    },
    doctors: {
        table: 'doctors',
        queryKeys: [['admin', 'doctors'], ['doctor-record'], ['doctor'], ['doctors']],
    },
};

export function useRealtimeUpdates(tables: (keyof typeof TABLE_MAP)[]) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase.channel('realtime-updates');

        tables.forEach(key => {
            const config = TABLE_MAP[key];
            if (!config) return;

            channel.on(
                'postgres_changes' as any,
                { event: '*', schema: 'public', table: config.table },
                () => {
                    // Invalidate all matching query keys when any change happens
                    config.queryKeys.forEach(qk => {
                        queryClient.invalidateQueries({ queryKey: qk });
                    });
                }
            );
        });

        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, tables.join(',')]);
}
