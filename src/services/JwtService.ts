import { jwtDecode} from "jwt-decode";
import { JwtPayload } from "~/utils/RequireAdmin";

export function isToken(){
    const token = localStorage.getItem('token');
    if(token){
        return true;
    }else{
        return false;
    }
}

export function isTokenExpired(token: string) {
    const decodedToken = jwtDecode(token);
    if (!decodedToken.exp) {
        return true; // Không có thời gian hết hạn, coi như đã hết hạn
    }
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính theo giây
    // So sánh thời gian hết hạn với thời gian hiện tại
    return decodedToken.exp < currentTime;
}

//  export function getAvatarByToken(){
//     const token = localStorage.getItem('token');
//     if(token){
//         const decodedToken = jwtDecode(token) as JwtPayload;
//         return decodedToken.avatar;
//     }
// }

// export function getFirstNameByToken(){
//     const token = localStorage.getItem('token');
//     if(token){
//         const decodedToken = jwtDecode(token) as JwtPayload;
//         return decodedToken.firstName
//     }
// }

export function getRoleByToken(){
    const token = localStorage.getItem('token');
    if(token){
        const decodedToken = jwtDecode(token) as JwtPayload;
        return decodedToken.role;
    }
}

// export function isActiveByToken(){
//     const token = localStorage.getItem('token');
//     if(token){
//         const decodedToken = jwtDecode(token) as JwtPayload;
//         if(decodedToken.active){
//             return true;
//         }
//         return false;
//     }
// }

export function getUserIDByToken(){
    const token = localStorage.getItem('token');
    if(token){
        const decodedToken = jwtDecode(token) as JwtPayload;
        return decodedToken.jti;
    }
}

export function getUsernameByToken(){
    const token = localStorage.getItem('token');
    if(token){
        const decodedToken = jwtDecode(token);
        return decodedToken.sub;
    }
}

export function getEmailByToken(){
    const token = localStorage.getItem('token');
    if(token){
        const decodedToken = jwtDecode(token) as JwtPayload;
        return decodedToken.email;
    }
}

export function logout() {
    localStorage.removeItem('token');
}