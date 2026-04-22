export function validateAccount(req, res, next) {
    const { asset_type, institution, name, balance } = req.body;

    if (!asset_type || !institution || !name) {
        return res.status(400).json({
            success: false,
            message: '필수 필드 누락: asset_type, institution, name'
        });
    }

    if (name.length < 1 || name.length > 50) {
        return res.status(400).json({
            success: false,
            message: '계좌명은 1~50자여야 합니다'
        });
    }

    if (balance !== undefined && (typeof balance !== 'number' || balance < 0)) {
        return res.status(400).json({
            success: false,
            message: '잔액은 0 이상의 숫자여야 합니다'
        });
    }

    next();
}

export function validateUpdateAccount(req, res, next) {
    const { name, balance } = req.body;

    if (!name && balance === undefined) {
        return res.status(400).json({
            success: false,
            message: '수정할 필드가 없습니다'
        });
    }

    if (name && (name.length < 1 || name.length > 50)) {
        return res.status(400).json({
            success: false,
            message: '계좌명은 1~50자여야 합니다'
        });
    }

    next();
}