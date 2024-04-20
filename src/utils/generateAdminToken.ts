import jwt from "jsonwebtoken";

const generateAdminToken = (id: string): string => {
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export default generateAdminToken;