import express from 'express';
import { supabase } from '../utils/supabase.js';
import { validateAccount, validateUpdateAccount } from '../middleware/validation.js';

const router = express.Router();

function getUserId(req) {
    return req.headers['user-id'] || 'test-user-' + Math.random().toString(36).substr(2, 9);
}

// ==================== Swagger 문서 ====================

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: 계좌 생성
 *     description: 새로운 계좌를 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_type
 *               - institution
 *               - name
 *             properties:
 *               asset_type:
 *                 type: string
 *                 enum: [card, account, virtual]
 *                 example: card
 *               institution:
 *                 type: string
 *                 example: 삼성
 *               asset_subtype:
 *                 type: string
 *                 example: 신용카드
 *               name:
 *                 type: string
 *                 example: 내 신용카드
 *               balance:
 *                 type: number
 *                 example: 5000000
 *     responses:
 *       201:
 *         description: 계좌 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: 입력값 오류
 */
router.post('/', validateAccount, async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { asset_type, institution, asset_subtype, name, balance = 0 } = req.body;

        const { data, error } = await supabase
            .from('accounts')
            .insert([{
                user_id: userId,
                asset_type,
                institution,
                asset_subtype: asset_subtype || null,
                name,
                balance
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                message: '계좌 생성 실패',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: '계좌가 생성되었습니다',
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: 모든 계좌 조회
 *     description: 사용자의 모든 계좌를 조회합니다
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = getUserId(req);

        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: '계좌 조회 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `${data.length}개의 계좌를 조회했습니다`,
            data,
            count: data.length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: 특정 계좌 조회
 *     description: ID로 특정 계좌를 조회합니다
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: 계좌를 찾을 수 없음
 */
router.get('/:id', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: '계좌를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   patch:
 *     summary: 계좌 수정
 *     description: 계좌 정보를 수정합니다
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공
 *       403:
 *         description: 권한 없음
 */
router.patch('/:id', validateUpdateAccount, async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        const updateData = req.body;

        const { data: account, error: checkError } = await supabase
            .from('accounts')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !account) {
            return res.status(404).json({
                success: false,
                message: '계좌를 찾을 수 없습니다'
            });
        }

        if (account.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: '이 계좌를 수정할 권한이 없습니다'
            });
        }

        const { data, error } = await supabase
            .from('accounts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                message: '계좌 수정 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: '계좌가 수정되었습니다',
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: 계좌 삭제
 *     description: 계좌를 삭제합니다
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       403:
 *         description: 권한 없음
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { data: account, error: checkError } = await supabase
            .from('accounts')
            .select('user_id')
            .eq('id', id)
            .single();

        if (checkError || !account) {
            return res.status(404).json({
                success: false,
                message: '계좌를 찾을 수 없습니다'
            });
        }

        if (account.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: '이 계좌를 삭제할 권한이 없습니다'
            });
        }

        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '계좌 삭제 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: '계좌가 삭제되었습니다'
        });
    } catch (error) {
        next(error);
    }
});

export default router;