import { Jwt, JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";



const secret: string = process.env.JWT_SECRET;


function createToken(user: object): string {
    const token: string = jwt.sign({ user }, secret, { expiresIn: "1h" });

    return token;
}

// const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

function getTokenFromReq(req: any) {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = verifyToken(token);

    return decoded;
}



function verifyToken(token: string): JwtPayload {

    const payload: JwtPayload = jwt.verify(token, secret) as JwtPayload;

    return payload;
}


export { createToken, verifyToken, getTokenFromReq }