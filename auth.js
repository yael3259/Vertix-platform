import jwt from 'jsonwebtoken';



export const auth = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token)
        return res.status(401).json({ message: "Access denied. No token provided" });

    try {
        const user = jwt.verify(token, process.env.SECRET_JWT);
        req.user = user;
        next();
    } catch (err) {
        return res.status(400).json({ message: "Invalid token" });
    }
}
