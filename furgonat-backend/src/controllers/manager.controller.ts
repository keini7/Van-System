import { Request, Response } from "express";

export const getManagerDashboard = (req: Request, res: Response) => {
  const user = (req as any).user;

  res.json({
    message: "Welcome to Van Manager Dashboard 🚐",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
};
