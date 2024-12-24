export interface SolveRequest {
  type: "solve";
  day: number;
  input: string;
  id: number;
}

export interface SuccessResponse {
  type: "success";
  id: number;
  partOne: string;
  partTwo: string;
}

export interface ErrorResponse {
  type: "error";
  id: number;
  message: string;
}

export type IPCRequest = SolveRequest;
export type IPCResponse = SuccessResponse | ErrorResponse;
