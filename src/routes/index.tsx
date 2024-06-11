import { RouteObject } from "react-router-dom";
import Home from "../pages/home";
import About from "../pages/about";
import Quotation from "../pages/quotation";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/quotation",
    element: <Quotation />,
  },
];

export default routes;
