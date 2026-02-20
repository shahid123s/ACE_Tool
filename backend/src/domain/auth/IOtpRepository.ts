export interface IOtpRepository {
    save(email: string, otp: string, ttlSeconds: number): Promise<void>;
    get(email: string): Promise<string | null>;
    delete(email: string): Promise<void>;
}
