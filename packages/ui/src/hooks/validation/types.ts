export interface ValidationError<T> {
  type: T;
  message: string;
}

export type Validation<T> = {
  isValid: boolean;
  errors?: ValidationError<T>[];
};

export type ValidationToken = { symbol: string; decimals: number };
