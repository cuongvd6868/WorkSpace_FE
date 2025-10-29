export type WorkSpace = {
    id: number,
    title: string,
    description: string,
}

export type WorkSpaceSearch = {
    id: number,
    title: string,
    description: string,
    ward: string,
    street: string,
    hostName: string,
    amenities?: string[]
}