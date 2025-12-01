import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const submitResponse: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getResponses: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=responseController.d.ts.map