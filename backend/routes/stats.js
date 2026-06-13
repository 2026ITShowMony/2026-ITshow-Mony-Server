import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

// POST /api/stats/increment
router.post('/increment', async (req, res, next) => {
    try {
        const { data: current, error: fetchError } = await supabase
            .from('visitor_stats')
            .select('count')
            .eq('id', 1)
            .single();

        if (fetchError) throw fetchError;

        const newCount = (current?.count || 0) + 1;

        const { data, error } = await supabase
            .from('visitor_stats')
            .update({ count: newCount })
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, count: data.count });
    } catch (error) {
        next(error);
    }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('visitor_stats')
            .select('count')
            .eq('id', 1)
            .single();

        if (error) throw error;

        res.json({ success: true, count: data?.count || 0 });
    } catch (error) {
        next(error);
    }
});

export default router;
