// routes/analysis.js
import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

function getUserId(req) {
    return req.headers['user-id'] || 'test-user-' + Math.random().toString(36).substr(2, 9);
}

// 공통: 계좌 ID 가져오기
async function getAccountIds(userId) {
    const { data, error } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map(a => a.id);
}

// 공통: 날짜 범위 생성
function getDateRange(periodDetail) {
    const [year, month] = periodDetail.split('-');
    const start = `${year}-${month}-01`;
    const endDate = new Date(Number(year), Number(month), 0);
    endDate.setHours(23, 59, 59, 999);
    const end = endDate.toISOString().split('T')[0];
    return { start, end };
}

// 목표 vs 카테고리 소비 비교
router.get('/goal-category/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const accountIds = await getAccountIds(userId);
        if (accountIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const { start, end } = getDateRange(periodDetail);

        const { data, error } = await supabase
            .from('transactions')
            .select('category, amount')
            .in('account_id', accountIds)
            .gte('transaction_date', start)
            .lte('transaction_date', end);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '카테고리 조회 실패',
                error: error.message
            });
        }

        const map = {};
        for (const row of data) {
            const key = row.category || '미분류';
            map[key] = (map[key] || 0) + row.amount;
        }

        res.json({
            success: true,
            categories: Object.entries(map).map(([k, v]) => ({
                category: k,
                total: v,
            }))
        });
    } catch (error) {
        next(error);
    }
});

// 카테고리별 소비
router.get('/category/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const accountIds = await getAccountIds(userId);
        if (accountIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const { start, end } = getDateRange(periodDetail);

        const { data, error } = await supabase
            .from('transactions')
            .select('category, amount')
            .in('account_id', accountIds)
            .gte('transaction_date', start)
            .lte('transaction_date', end);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '카테고리 소비 조회 실패',
                error: error.message
            });
        }

        const map = {};
        for (const row of data) {
            const key = row.category || '미분류';
            map[key] = (map[key] || 0) + row.amount;
        }

        res.json({
            success: true,
            data: Object.entries(map).map(([k, v]) => ({
                category: k,
                total: v,
            }))
        });
    } catch (error) {
        next(error);
    }
});

// 총 지출 요약
router.get('/summary/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const accountIds = await getAccountIds(userId);
        if (accountIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const { start, end } = getDateRange(periodDetail);

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, is_fixed')
            .in('account_id', accountIds)
            .gte('transaction_date', start)
            .lte('transaction_date', end);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '지출 요약 조회 실패',
                error: error.message
            });
        }

        const total = data.reduce((s, r) => s + r.amount, 0);
        const fixed = data.filter(r => r.is_fixed).reduce((s, r) => s + r.amount, 0);

        res.json({
            success: true,
            data: {
                total,
                fixed,
                variable: total - fixed,
            }
        });
    } catch (error) {
        next(error);
    }
});

// 일별 누적 소비
router.get('/daily/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const accountIds = await getAccountIds(userId);
        if (accountIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const { start, end } = getDateRange(periodDetail);

        const { data, error } = await supabase
            .from('transactions')
            .select('transaction_date, amount')
            .in('account_id', accountIds)
            .gte('transaction_date', start)
            .lte('transaction_date', end)
            .order('transaction_date', { ascending: true });

        if (error) {
            return res.status(400).json({
                success: false,
                message: '일별 소비 조회 실패',
                error: error.message
            });
        }

        const map = {};
        for (const row of data) {
            map[row.transaction_date] = (map[row.transaction_date] || 0) + row.amount;
        }

        let cumulative = 0;
        const result = Object.entries(map)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, amount]) => {
                cumulative += amount;
                return { date, daily: amount, cumulative };
            });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// 미분류 소비
router.get('/uncategorized/:periodDetail', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { periodDetail } = req.params;

        const accountIds = await getAccountIds(userId);
        if (accountIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: '연결된 계좌/카드가 없습니다'
            });
        }

        const { start, end } = getDateRange(periodDetail);

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .in('account_id', accountIds)
            .or('category.is.null,category.eq.미분류')
            .gte('transaction_date', start)
            .lte('transaction_date', end);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '미분류 소비 조회 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            data,
            count: data.length
        });
    } catch (error) {
        next(error);
    }
});

export default router;