import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TooltifyError } from "#common/errors/tooltify.error";
import type { VaultService } from "./vault.service";

const JWT_EXPIRY = 24 * 60 * 60;

export class AuthService {
  private secret: string;
  private salt: string;
  private vault: VaultService;

  constructor(opts: { secret: string; salt: string }, vault: VaultService) {
    this.secret = opts.secret;
    this.salt = opts.salt;
    this.vault = vault;
  }

  jwtSign(payload: Record<string, unknown>) {
    return jwt.sign(payload, this.secret, { expiresIn: JWT_EXPIRY });
  }

  jwtVerify(token: string): Record<string, any> | null {
    try {
      const payload = jwt.verify(token, this.secret) as Record<string, any>;
      const entry = this.vault.get(payload.user);
      if (!entry || entry.fp !== payload.fp) return null;
      return payload;
    } catch {
      return null;
    }
  }

  getUsers(): string[] {
    return this.vault.keys();
  }

  verifyCredentials(user: string, password: string): void {
    const hash = crypto.createHash("sha256").update(this.salt + password).digest("hex");
    const entry = this.vault.get(user);
    if (!entry || entry.hash !== hash) throw new TooltifyError("Invalid credentials", "INVALID_CREDENTIALS", 401);
  }

  login(user: string, password: string) {
    this.verifyCredentials(user, password);
    const entry = this.vault.get(user)!;
    return { token: this.jwtSign({ user, fp: entry.fp }), user };
  }

  get expiry() {
    return JWT_EXPIRY;
  }
}
