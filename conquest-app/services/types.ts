export interface Pagination<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface PaginationRequest {
    page: number;
    size: number;
}

export interface IdResponse {
    id: string
}