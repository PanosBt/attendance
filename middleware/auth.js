import pkg from "jsonwebtoken";
const { verify } = pkg;
import config from "../config.js";

const auth =  (ctx, next) =>{
    try {
        const token = ctx.get('Authorization');
        if(!token){
            ctx.status=400;
            ctx.body="Invalid Authentication";
        }else{
            verify(token, config.ACCESS_TOKEN_SECRET , (err, user) =>{
                if (err){
                    ctx.status=400;
                    ctx.body="Invalid Authentication";
                } else{
                    ctx.request.user = user;
                    next();
                }
            })
        }
    } catch (err) {
        ctx.status=500;
        ctx.body=err.message;
    }
}

export default auth;
