export type UserProfileToken = {
    userName: string,
    email: string,
    jwtToken: string,
    roles: string[];
}

export type UserProfile = {
    userName: string,
    email: string,
    roles: string[];
}