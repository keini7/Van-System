import { Request, Response } from "express";

export const getUserDashboard = (req: Request, res: Response) => {
  const user = (req as any).user; // e vendos authMiddleware nga token

  res.json({
    message: "Welcome to User Dashboard 🚗",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};
