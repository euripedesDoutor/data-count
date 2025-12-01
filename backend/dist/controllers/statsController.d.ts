import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGoalEvolution: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDashboardSurveys: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=statsController.d.ts.map