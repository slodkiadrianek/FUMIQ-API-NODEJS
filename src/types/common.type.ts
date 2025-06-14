import { Request } from "express";

export interface RedisCacheService {
  set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number; NX?: boolean; XX?: boolean },
  ): Promise<"OK" | null>;

  get(key: string): Promise<string | null>;

  del(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}

export interface emailSend {
  to: string;
  subject: string;
  message: string;
}
export type CustomRequest = Request & {
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    iat: number;
  };
};
