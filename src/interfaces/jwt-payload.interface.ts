export interface JwtPayload {
  id: string;
  email?: string;
  role: "OWNER" | "SALESMAN";
}