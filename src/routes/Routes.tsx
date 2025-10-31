import { createBrowserRouter } from "react-router-dom";
import App from "~/App";
import HomePage from "~/pages/home/HomePage";
import LoginPage from "~/pages/login/LoginPage";
import MapPageView from "~/pages/map/MapPageView";
import SearchResults from "~/pages/search/SearchResultsPage";

export const router = createBrowserRouter([{
    path: "/",
    element: <App/>,
    children: [
        {path: "", element: <HomePage/>},
        {path: "/login", element: <LoginPage/>},
        {path: "/search-results", element: <SearchResults/>},
        {path: "/map-view", element: <MapPageView/>},
        // {path: "/map-view", element: <MapPageView/>},
    ]
}]);