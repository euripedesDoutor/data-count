import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const createCollector: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCollectors: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCollector: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCollector: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=collectorController.d.ts.map