export interface ApiError {
  type: string;
  title: string;
  status: number;
  instance: string;
  detail?: string;
  errors?: ConstraintValidation[];
}

export interface ConstraintValidation {
  type: "FIELD" | "OBJECT";
  objectName: string;
  field?: string;
  message: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedRequest {
  page: number;
  size: number;
  sort?: string;
}
