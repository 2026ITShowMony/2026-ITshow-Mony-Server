import express from 'express';
import { supabase } from '../utils/supabase.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bank
 *   description: 저축 저금통 API
 */

/**
 * @swagger
 * /api/bank:
 *   post:
 *     summary: 저금통 생성
 *     tags: [Bank]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               savings_goal:
 *                 type: integer
 *                 example: 1000000
 *               savings_method:
 *                 type: string
 *                 enum: [절약, 직접]
 *                 example: 절약
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 생성 실패
 */
router.post('/', async (req, res, next) => {
    try {
        const { savings_goal, savings_method } = req.body;

        const validMethods = ['절약', '직접'];
        if (savings_method && !validMethods.includes(savings_method)) {
            return res.status(400).json({
                success: false,
                message: 'savings_method는 절약, 직접 중 하나여야 합니다'
            });
        }

        const { data, error } = await supabase
            .from('bank')
            .insert([{ savings_goal, savings_method }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                message: '저금통 생성 실패',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: '저금통이 생성되었습니다',
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/bank:
 *   get:
 *     summary: 저금통 전체 조회
 *     tags: [Bank]
 *     responses:
 *       200:
 *         description: 조회 성공
 *       400:
 *         description: 조회 실패
 */
router.get('/', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('bank')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: '저금통 조회 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: `${data.length}개의 저금통을 조회했습니다`,
            data,
            count: data.length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/bank/{id}:
 *   patch:
 *     summary: 저금통 수정
 *     tags: [Bank]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               savings_goal:
 *                 type: integer
 *                 example: 2000000
 *               savings_method:
 *                 type: string
 *                 enum: [절약, 직접]
 *                 example: 직접
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 저금통 없음
 */
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { savings_goal, savings_method } = req.body;

        const validMethods = ['절약', '직접'];
        if (savings_method && !validMethods.includes(savings_method)) {
            return res.status(400).json({
                success: false,
                message: 'savings_method는 절약, 직접 중 하나여야 합니다'
            });
        }

        const { data, error } = await supabase
            .from('bank')
            .update({ savings_goal, savings_method })
            .eq('id', id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: '저금통을 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            message: '저금통이 수정되었습니다',
            data
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/bank/{id}:
 *   delete:
 *     summary: 저금통 삭제
 *     tags: [Bank]
 *     parameters:
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
 *         description: 저금통 없음
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: bank, error: checkError } = await supabase
            .from('bank')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !bank) {
            return res.status(404).json({
                success: false,
                message: '저금통을 찾을 수 없습니다'
            });
        }

        const { error } = await supabase
            .from('bank')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({
                success: false,
                message: '저금통 삭제 실패',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: '저금통이 삭제되었습니다'
        });
    } catch (error) {
        next(error);
    }
});

export default router;