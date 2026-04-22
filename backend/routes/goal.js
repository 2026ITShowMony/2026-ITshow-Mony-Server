//goal 관련된 db소스
import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

function getUserId(req) {
    return req.headers['user-id'] || 'test-user-' + Math.random().toString(36).substr(2, 9);
}

// 목표 생성
router.post('/', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { goal_type, period_type, period_detail, salary_timing, target_amount } = req.body;

        const { data, error } = await supabase
            .from('goal')
            .insert([{
                user_id: userId,
                goal_type,
                period_type,
                period_detail,
                salary_timing,
                target_amount,
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                message: '목표 생성 실패',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: '목표가 생성되었습니다',
            data
        });
    } catch (error) {
        next(error);
    }
});

// 목표 조회
router.get('/', async (req, res, next) => {
    try {
        const userId = getUserId(req);

        const { data, error } = await supabase
            .from('goal')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: '목표 조회 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `${data.length}개의 목표를 조회했습니다`,
            data,
            count: data.length
        });
    } catch (error) {
        next(error);
    }
});

// 목표 진행률 계산
router.get('/progress/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const { data: goal, error: goalError } = await supabase
            .from('goal')
            .select('target_amount')
            .eq('user_id', userId)
            .eq('period_detail', periodDetail)
            .single();

        if (goalError) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다',
                error: goalError.message
            });
        }

        // 날짜 범위 계산
        const [year, month] = periodDetail.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data: accounts, error: accError } = await supabase
            .from('accounts')
            .select('id')
            .eq('user_id', userId);

        if (accError || !accounts.length) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const accountIds = accounts.map(a => a.id);

        const { data: tr, error: trError } = await supabase
            .from('transactions')
            .select('amount')
            .in('account_id', accountIds)
            .gte('transaction_date', startDate)
            .lte('transaction_date', endDate);

        if (trError) {
            return res.status(400).json({
                success: false,
                message: '지출 조회 실패',
                error: trError.message
            });
        }

        const totalSpent = tr.reduce((sum, t) => sum + t.amount, 0);
        const progress = totalSpent / goal.target_amount;

        let warningLevel = null;
        if (progress >= 1.0) warningLevel = '초과';
        else if (progress >= 0.9) warningLevel = '90%';
        else if (progress >= 0.8) warningLevel = '80%';

        res.json({
            success: true,
            totalSpent,
            targetAmount: goal.target_amount,
            remaining: goal.target_amount - totalSpent,
            progress,
            progressPercent: Math.round(progress * 100),
            warningLevel
        });
    } catch (error) {
        next(error);
    }
});

// 목표 삭제
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { data: goal, error: checkError } = await supabase
            .from('goal')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다'
            });
        }

        if (goal.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: '이 목표를 삭제할 권한이 없습니다'
            });
        }

        const { error } = await supabase
            .from('goal')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '목표 삭제 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: '목표가 삭제되었습니다'
        });
    } catch (error) {
        next(error);
    }
});

export default router;