import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const createSurvey: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSurveys: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSurveyById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateSurvey: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteSurvey: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cloneSurvey: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=surveyController.d.ts.map