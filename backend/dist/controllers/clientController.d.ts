import type { Request, Response } from 'express';
export declare const createClient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getClients: (req: Request, res: Response) => Promise<void>;
export declare const updateClient: (req: Request, res: Response) => Promise<void>;
export declare const deleteClient: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=clientController.d.ts.map