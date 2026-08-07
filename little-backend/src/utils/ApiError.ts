export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }

  static badRequest(message: string, code = "bad_request") {
    return new ApiError(400, code, message);
  }
  static unauthorized(message = "Unauthorized", code = "unauthorized") {
    return new ApiError(401, code, message);
  }
  static forbidden(message = "Forbidden", code = "forbidden") {
    return new ApiError(403, code, message);
  }
  static notFound(message = "Not found", code = "not_found") {
    return new ApiError(404, code, message);
  }
  static conflict(message: string, code = "conflict") {
    return new ApiError(409, code, message);
  }
  static unprocessable(message: string, code = "unprocessable") {
    return new ApiError(422, code, message);
  }
}
