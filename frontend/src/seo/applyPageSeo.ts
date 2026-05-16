import { SITE_NAME, SITE_URL, type RouteSeoConfig } from "./config";

function upsertMeta(
    selector: string,
    create: () => HTMLElement,
    apply: (el: HTMLElement) => void
) {
    let el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
        el = create();
        document.head.appendChild(el);
    }
    apply(el);
}

function setMetaName(name: string, content: string) {
    upsertMeta(
        `meta[name="${name}"]`,
        () => {
            const meta = document.createElement("meta");
            meta.setAttribute("name", name);
            return meta;
        },
        (el) => el.setAttribute("content", content)
    );
}

function setMetaProperty(property: string, content: string) {
    upsertMeta(
        `meta[property="${property}"]`,
        () => {
            const meta = document.createElement("meta");
            meta.setAttribute("property", property);
            return meta;
        },
        (el) => el.setAttribute("content", content)
    );
}

function setCanonical(url: string) {
    upsertMeta(
        'link[rel="canonical"]',
        () => {
            const link = document.createElement("link");
            link.setAttribute("rel", "canonical");
            return link;
        },
        (el) => el.setAttribute("href", url)
    );
}

export function applyPageSeo(config: RouteSeoConfig) {
    const title = config.title.includes(SITE_NAME)
        ? config.title
        : `${config.title} | ${SITE_NAME}`;

    document.title = title;

    const description = config.description;
    const canonical =
        SITE_URL && config.index !== false
            ? `${SITE_URL}${config.path === "/" ? "" : config.path}`
            : SITE_URL
              ? `${SITE_URL}${config.path}`
              : `${window.location.origin}${config.path}`;

    const ogImage = SITE_URL ? `${SITE_URL}/logo.png` : "/logo.png";

    setMetaName("description", description);
    setMetaName(
        "robots",
        config.index === false ? "noindex, nofollow" : "index, follow"
    );
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);

    setMetaProperty("og:type", config.path === "/" ? "website" : "article");
    setMetaProperty("og:site_name", SITE_NAME);
    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", canonical);
    setMetaProperty("og:image", ogImage);

    setCanonical(canonical);
}
