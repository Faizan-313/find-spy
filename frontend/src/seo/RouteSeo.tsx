import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageSeo } from "./applyPageSeo";
import { getRouteSeo } from "./config";

export default function RouteSeo() {
    const { pathname } = useLocation();

    useEffect(() => {
        applyPageSeo(getRouteSeo(pathname));
    }, [pathname]);

    return null;
}
