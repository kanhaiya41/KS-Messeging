import jwt from 'jsonwebtoken';

export const isAthenticatedi = async (req, res, next) => {
    try {
        const token = req.cookies.token;
       
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'You are not authenticated'
            });
        }
        const decode = await jwt.verify(token,process.env.SECRET_KEY);
        if (!decode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tokens'
            });
        }
        req.id=decode.userId;
        
        next();
    } catch (error) {
        console.log("while authentication",error);
        return res.status(401).json({
            success:false,
            message:'authentication error'
        })
    }
}