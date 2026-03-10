import crypto from "crypto";

const AUTH_SALT = "devtools-2024";
const JWT_EXPIRY = 24 * 60 * 60;
const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");

export interface UserEntry {
  hash: string;
}

export class AuthService {
  private secret: string;
  private users: Record<string, UserEntry>;

  constructor(opts: { secret: string; users: Record<string, UserEntry> }) {
    this.secret = opts.secret;
    this.users = opts.users;
  }

  jwtSign(payload: Record<string, unknown>) {
    const header = b64url({ alg: "HS256", typ: "JWT" });
    const body = b64url({ ...payload, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY });
    const sig = crypto.createHmac("sha256", this.secret).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${sig}`;
  }

  jwtVerify(token: string): Record<string, any> | null {
    try {
      const [header, body, sig] = token.split(".");
      const expected = crypto.createHmac("sha256", this.secret).update(`${header}.${body}`).digest("base64url");
      if (sig !== expected) return null;
      const payload = JSON.parse(Buffer.from(body, "base64url").toString());
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload;
    } catch {
      return null;
    }
  }

  getUsers(): string[] {
    return Object.keys(this.users);
  }

  verifyCredentials(user: string, password: string): boolean {
    const entry = this.users[user];
    if (!entry) return false;
    const hash = crypto.createHash("sha256").update(AUTH_SALT + password).digest("hex");
    return entry.hash === hash;
  }

  get expiry() {
    return JWT_EXPIRY;
  }
}
