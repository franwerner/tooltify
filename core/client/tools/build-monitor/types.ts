export type EventStatus = "building" | "done" | "error";
export type ErrorType = "compile" | "runtime";

export interface RebuildEvent {
  user: string;
  file: string;
  timestamp: number;
  applied: boolean;
  status: EventStatus;
  error?: string;
  errorType?: ErrorType;
}
