import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

function getUserId(req) {
    return req.headers['user-id'] || null;
}

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: 목표 API
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: 목표 생성
 *     tags: [Goals]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         required: true
 *         schema:
 *           type: string
 *         example: 88568caa-8330-42e2-8499-cf2ec4881b27
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal_type:
 *                 type: string
 *                 example: 저축
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 생성 실패
 */
router.post('/', async (req, res, next) => {
    try {
        const userId = getUserId(req);
        const { goal_type } = req.body;

        const { data, error } = await supabase
            .from('goal')
            .insert([{
                user_id: userId,
                goal_type,
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

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: 목표 조회
 *     tags: [Goals]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         required: true
 *         schema:
 *           type: string
 *         example: 88568caa-8330-42e2-8499-cf2ec4881b27
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 조회 실패
 */
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

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: 목표 삭제
 *     tags: [Goals]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         required: true
 *         schema:
 *           type: string
 *         example: 88568caa-8330-42e2-8499-cf2ec4881b27
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 목표 없음
 */
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