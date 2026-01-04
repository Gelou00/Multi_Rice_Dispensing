import jwt from "jsonwebtoken";

const userAuthentication = async(req, res, next) =>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({success: false, message: "Authentication failed!"});
    }

    try{

        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        if(!tokenData.id){
            return res.status(401).json({success: false, message: "Authentication failed!"});   
        }

        if(!req.body){
            req.body = {};
        }
        req.body._id = tokenData.id;
        next();

    }catch(error){
        return res.status(500).json({success: false, message: error.message});
    }
}

export default userAuthentication;