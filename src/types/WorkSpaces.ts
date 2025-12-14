import { WorkSpaceRoom } from "./WorkSpaceRoom"

export type WorkSpace = {
    id: number,
    title: string,
    description: string,
    thumbnailUrl: string
}

export type WorkSpaceSearch = {
    id: number,
    title: string,
    description: string,
    ward: string,
    street: string,
    hostName: string,
    amenities?: string[],
    latitude: number,
    longitude: number,
    thumbnailUrl: string
}

export type WorkSpaceDetail = {
    id: number,
    title: string,
    description: string,
    hostId: number,
    hostName: string,
    hostCompanyName: string,
    hostContactPhone: string,
    addressLine: string,
    ward: string,
    latitude: number,
    longitude: number,
    workSpaceType: string,
    rooms: WorkSpaceRoom[],
    isActive: boolean
}