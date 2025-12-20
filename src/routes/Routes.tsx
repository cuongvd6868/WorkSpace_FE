import { createBrowserRouter } from "react-router-dom";
import App from "~/App";
import BookingCheckout from "~/pages/booking/BookingCheckout/BookingCheckout";
import HomePage from "~/pages/home/HomePage";
import LoginPage from "~/pages/login/LoginPage";
import MapPageView from "~/pages/map/MapPageView";
import SearchResults from "~/pages/search/SearchResultsPage";
import WorkspaceDetail from "~/pages/workspaceDetail/WorkspaceDetail";
import PaymentSuccess from "~/pages/booking/PaymentResult/Success/PaymentSuccess";
import BookingList from "~/pages/booking/BookingList/BookingList";
import AdminDasdboard from "~/pages/admin/AdminDasdboard";
import OwnerDashboard from "~/pages/owner/OwnerDashboard";
import StaffDashboard from "~/pages/staff/StaffDashboard";
import HostRegistrationPage from "~/pages/host/HostRegistrationPage/HostRegistrationPage";
import SupportPage from "~/pages/support/SupportPage";
import PostPage from "~/pages/post/PostPage";
import FavoriteList from "~/pages/favorites/FavoriteList";
import UpdateProfilePage from "~/pages/profile/UpdateProfilePage";
import VerifyAccountPage from "~/pages/login/VerifyAccountPage"; 

import ChangePassword from "~/pages/password/ChangePassword";



export const router = createBrowserRouter([{
    path: "/",
    element: <App/>,
    children: [
        {path: "", element: <HomePage/>},
        {path: "/login", element: <LoginPage/>},
        {path: "/search-results", element: <SearchResults/>},
        {path: "/map-view", element: <MapPageView/>},
        {path: "/workspace/:id", element: <WorkspaceDetail/>},
        {path: "/posts/:id", element: <PostPage/>},
        {path: "/booking/checkout", element: <BookingCheckout/>},
        {path: "/payment-result/success", element: <PaymentSuccess/>},
        {path: "/booking-list", element: <BookingList/>},
        {path: "/host-register", element: <HostRegistrationPage/>},
        {path: "/admin", element: <AdminDasdboard/>},
        {path: "/owner", element: <OwnerDashboard/>},
        {path: "/staff", element: <StaffDashboard/>},
        {path: "/support", element: <SupportPage/>},
        {path: "/favorites", element: <FavoriteList/>},
        {path: "/update-profile", element: <UpdateProfilePage/>},

        
        // Route mới để xử lý verify email
        {path: "/confirm-email", element: <VerifyAccountPage/>},

        {path: "/change-password", element: <ChangePassword/>},

    ]
}]);