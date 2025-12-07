export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCategory: string,
    public errorDescription: string
  ) {
    super(errorDescription);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = errorCategory;
  }
}
