export interface IError extends Error {
  statusCode?: number;
  title?: string;
}
