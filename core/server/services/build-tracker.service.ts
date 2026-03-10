import type { Namespace } from "socket.io";
import type { UserTrackerService } from "./user-tracker.service";

export interface RebuildInfo {
  user: string;
  file: string;
  errors?: string[];
  errorFiles?: { file: string; user: string }[];
}

export interface BuildResult extends RebuildInfo {
  ok: boolean;
  hash?: string;
}

export class BuildTrackerService {
  private state: "idle" | "rebuilding" | "success" | "error" = "idle";
  private pending: RebuildInfo = { user: "unknown", file: "" };
  private last: BuildResult = { ok: true, user: "unknown", file: "", errors: [], errorFiles: [] };
  private history = new Map<string, RebuildInfo>();
  private errorFiles = new Map<string, string>();

  constructor(
    private ns: Namespace,
    private userTracker: UserTrackerService,
  ) {
    this.ns.on("connection", (socket) => {
      socket.emit("status", this.last);
    });
  }

  onFilesChanged(files: string[]) {
    this.state = "rebuilding";
    for (const file of files) {
      const user = this.userTracker.resolveFileAuthor(file);
      console.log(`[rebuild] ${user} → ${file}`);
      this.pending = { user, file };
      this.errorFiles.set(file, user);
    }
    this.ns.emit("rebuild", this.pending);
  }

  onBuildDone(hash: string, hasErrors: boolean, errors: string[] = []) {
    const data: any = { ...this.pending };

    if (hasErrors) {
      this.state = "error";
      data.errors = errors;
      data.errorFiles = [...this.errorFiles.entries()].map(([file, user]) => ({ file, user }));
    } else {
      this.state = "success";
      this.errorFiles.clear();
    }

    this.history.set(hash, data);
    this.last = {
      ok: !hasErrors,
      hash,
      ...data,
      errorFiles: data.errorFiles || [],
    };
    this.ns.emit("done", this.last);

    if (this.history.size > 20) {
      const first = this.history.keys().next().value;
      if (first) this.history.delete(first);
    }
  }

  getStatus() {
    return this.last;
  }

  getRebuildInfo(hash: string) {
    return this.history.get(hash) || { user: "unknown", file: "" };
  }

}
