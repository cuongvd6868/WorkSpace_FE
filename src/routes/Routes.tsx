import { createBrowserRouter } from "react-router-dom";
import App from "~/App";
import BookingCheckout from "~/pages/booking/BookingCheckout/BookingCheckout";
import HomePage from "~/pages/home/HomePage";
import LoginPage from "~/pages/login/LoginPage";
import MapPageView from "~/pages/map/MapPageView";
import SearchResults from "~/pages/search/SearchResultsPage";
import WorkspaceDetail from "~/pages/workspaceDetail/WorkspaceDetail";
import PaymentSuccess from "~/pages/booking/PaymentResult/Success/PaymentSuccess";
import HelpCenter from "~/pages/help/HelpCenter";

export const router = createBrowserRouter([{
    path: "/",
    element: <App/>,
    children: [
        {path: "", element: <HomePage/>},
        {path: "/login", element: <LoginPage/>},
        {path: "/search-results", element: <SearchResults/>},
        {path: "/map-view", element: <MapPageView/>},
        {path: "/workspace/:id", element: <WorkspaceDetail/>},
        {path: "/booking/checkout", element: <BookingCheckout/>},
        {path: "/payment-result/success", element: <PaymentSuccess/>},
        {path: "/help", element: <HelpCenter/>},
    ]
}]);