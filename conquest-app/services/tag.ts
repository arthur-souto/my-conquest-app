import { api } from "./api";
import { IdResponse, Pagination, PaginationRequest } from "./types";

export interface Tag {
    id: string;
    name: string;
    colorHex: string;
}

interface createTagRequest {
    name: string;
    colorHex: string;
}

interface updateTagRequest {
    name?: string;
    colorHex?: string
}

const PREFIX = "/tags"

export async function getMyTags(pag: PaginationRequest): Promise<Pagination<Tag>> {
    const { data } = await api.get<Pagination<Tag>>(`${PREFIX}`, {
        params: pag
    })

    return data;
}

export async function createTag(body: createTagRequest): Promise<IdResponse> {
    const { data } = await api.post<IdResponse>(`${PREFIX}`, body)
    
    return data;
}

export async function updateTag(id: string, body: updateTagRequest): Promise<IdResponse> {
    const {data} = await api.patch<IdResponse>(`${PREFIX}/${id}`, body)

    return data
}

export async function deleteTag(id: string): Promise<void> {
    const { data } = await api.delete<void>(`${PREFIX}/${id}`)
    
    return data;
}