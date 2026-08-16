// Services throw plain Errors, which controllers map to 400. This one carries
// the distinction that the caller is authenticated but not allowed, so the
// controller can answer 403 instead.
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
