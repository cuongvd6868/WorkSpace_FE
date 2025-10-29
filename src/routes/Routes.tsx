import { createBrowserRouter } from "react-router-dom";
import App from "~/App";
import HomePage from "~/pages/home/HomePage";
import LoginPage from "~/pages/login/LoginPage";
import SearchResults from "~/pages/search/SearchResultsPage";

export const router = createBrowserRouter([{
    path: "/",
    element: <App/>,
    children: [
        {path: "", element: <HomePage/>},
        {path: "/login", element: <LoginPage/>},
        {path: "/search-results", element: <SearchResults/>}
    ]
}]);