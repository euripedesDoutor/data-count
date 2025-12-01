import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getSurveyReport: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSurveyHeatmap: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=reportController.d.ts.map