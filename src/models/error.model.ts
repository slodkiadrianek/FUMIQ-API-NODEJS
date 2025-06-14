export class AppError {
    constructor(
      public statusCode: number,
      public errorCategory: string,
      public errorDescription: string
    ) {}
  }