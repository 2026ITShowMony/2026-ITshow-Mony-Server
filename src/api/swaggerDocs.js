/**
 * @swagger
 * tags:
 *   - name: Accounts
 *     description: src/api/accounts.jsx 기준 계좌/카드 API
 *   - name: Goals
 *     description: src/api/goal.jsx 기준 목표 API
 *   - name: Transactions
 *     description: src/api/transactions.jsx 기준 소비 분석 API
 *
 * components:
 *   schemas:
 *     ApiSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Supabase error message
 *     AccountInput:
 *       type: object
 *       required:
 *         - asset_type
 *         - institution
 *         - name
 *       properties:
 *         asset_type:
 *           type: string
 *           enum: [card, account, virtual]
 *           example: card
 *         institution:
 *           type: string
 *           example: 신한
 *         asset_subtype:
 *           type: string
 *           example: 신용카드
 *         name:
 *           type: string
 *           example: 생활비 카드
 *         balance:
 *           type: number
 *           example: 500000
 *     GoalInput:
 *       type: object
 *       required:
 *         - goal_type
 *         - period_type
 *         - period_detail
 *         - target_amount
 *       properties:
 *         goal_type:
 *           type: string
 *           example: monthly_budget
 *         period_type:
 *           type: string
 *           example: monthly
 *         period_detail:
 *           type: string
 *           example: "2026-05"
 *         salary_timing:
 *           type: string
 *           example: "25"
 *         target_amount:
 *           type: number
 *           example: 1000000
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     tags: [Accounts]
 *     summary: 계좌/카드 생성
 *     description: src/api/accounts.jsx의 createAccount 함수 기준 문서입니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountInput'
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 생성 실패
 *   get:
 *     tags: [Accounts]
 *     summary: 사용자의 모든 계좌/카드 조회
 *     description: src/api/accounts.jsx의 findAccounts 함수 기준 문서입니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *     responses:
 *       200:
 *         description: 조회 성공
 */

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: 특정 계좌/카드 상세 조회
 *     description: src/api/accounts.jsx의 findAccountById 함수 기준 문서입니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: 계좌를 찾을 수 없음
 *   patch:
 *     tags: [Accounts]
 *     summary: 계좌/카드 수정
 *     description: src/api/accounts.jsx의 updateAccount 함수 기준 문서입니다.
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
 *               name:
 *                 type: string
 *                 example: 수정된 카드명
 *               balance:
 *                 type: number
 *                 example: 300000
 *     responses:
 *       200:
 *         description: 수정 성공
 *   delete:
 *     tags: [Accounts]
 *     summary: 계좌/카드 삭제
 *     description: src/api/accounts.jsx의 deleteAccount 함수 기준 문서입니다.
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
 */

/**
 * @swagger
 * /api/accounts/{id}/balance:
 *   get:
 *     tags: [Accounts]
 *     summary: 거래를 반영한 현재 잔액 계산
 *     description: src/api/accounts.jsx의 getAccountBalance 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: 잔액 계산 성공
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     tags: [Goals]
 *     summary: 목표 생성
 *     description: src/api/goal.jsx의 createGoal 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoalInput'
 *     responses:
 *       201:
 *         description: 생성 성공
 *   get:
 *     tags: [Goals]
 *     summary: 목표 조회
 *     description: src/api/goal.jsx의 findGoal 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *     responses:
 *       200:
 *         description: 조회 성공
 */

/**
 * @swagger
 * /api/goals/progress:
 *   get:
 *     tags: [Goals]
 *     summary: 목표 진행률 계산
 *     description: src/api/goal.jsx의 progressGoal 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 진행률 계산 성공
 */

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     tags: [Goals]
 *     summary: 목표 삭제
 *     description: src/api/goal.jsx의 deleteGoal 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
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
 */

/**
 * @swagger
 * /api/transactions/goal-category:
 *   get:
 *     tags: [Transactions]
 *     summary: 목표 대비 카테고리 소비 비교
 *     description: src/api/transactions.jsx의 getGoalWithCategory 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 비교 조회 성공
 */

/**
 * @swagger
 * /api/transactions/categories:
 *   get:
 *     tags: [Transactions]
 *     summary: 카테고리별 소비 조회
 *     description: src/api/transactions.jsx의 getCategoryConsumption 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 조회 성공
 */

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     tags: [Transactions]
 *     summary: 총 지출 요약 조회
 *     description: src/api/transactions.jsx의 getSpendingSummary 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 요약 조회 성공
 */

/**
 * @swagger
 * /api/transactions/daily:
 *   get:
 *     tags: [Transactions]
 *     summary: 일별 누적 소비 조회
 *     description: src/api/transactions.jsx의 getDailySpending 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 조회 성공
 */

/**
 * @swagger
 * /api/transactions/uncategorized:
 *   get:
 *     tags: [Transactions]
 *     summary: 미분류 소비 조회
 *     description: src/api/transactions.jsx의 getUncategorizedTransactions 함수 기준 문서입니다. 백엔드 라우트 연결 전이면 Try it out은 동작하지 않을 수 있습니다.
 *     parameters:
 *       - in: header
 *         name: user-id
 *         schema:
 *           type: string
 *         example: test-user
 *       - in: query
 *         name: periodDetail
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05"
 *     responses:
 *       200:
 *         description: 조회 성공
 */
