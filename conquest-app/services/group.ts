import { api } from "../lib/api";
import { IdResponse, Pagination, PaginationRequest } from "./types";



export interface Group {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    achievementsCount?: number;
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
}

const PREFIX = "/groups";


export async function getGroups(pag: PaginationRequest) {

    const {data} = await api.get<Pagination<Group>>(`${PREFIX}`, { params: pag }) 
    
    return data
}

export async function createGroup(request: CreateGroupRequest) {
    const {data} = await api.post<IdResponse>(`${PREFIX}`, request)

    return data
}


export async function updateGroup(groupId: string, request: UpdateGroupRequest) {
    const {data} = await api.patch<IdResponse>(`${PREFIX}/${groupId}`, request)

    return data
}

export async function deleteGroup(groupId: string) {
    const {data} = await api.delete<void>(`${PREFIX}/${groupId}`)

    return data
}



