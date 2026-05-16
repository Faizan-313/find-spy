import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "./config";

const SCRIPT_ID = "find-spy-jsonld";

export default function WebSiteJsonLd() {
    useEffect(() => {
        const origin = SITE_URL || window.location.origin;
        const payload = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "@id": `${origin}/#website`,
                    url: origin,
                    name: SITE_NAME,
                    description: DEFAULT_DESCRIPTION,
                    inLanguage: "en",
                },
                {
                    "@type": "WebApplication",
                    "@id": `${origin}/#app`,
                    name: SITE_NAME,
                    url: origin,
                    description: DEFAULT_DESCRIPTION,
                    applicationCategory: "GameApplication",
                    operatingSystem: "Web browser",
                    offers: {
                        "@type": "Offer",
                        price: "0",
                        priceCurrency: "USD",
                    },
                    author: {
                        "@type": "Person",
                        name: "Peer Faizan",
                    },
                },
                {
                    "@type": "VideoGame",
                    name: SITE_NAME,
                    description: DEFAULT_DESCRIPTION,
                    url: origin,
                    gamePlatform: "Web browser",
                    numberOfPlayers: {
                        "@type": "QuantitativeValue",
                        minValue: 2,
                        maxValue: 8,
                    },
                    genre: "Social deduction",
                    playMode: "MultiPlayer",
                },
            ],
        };

        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement("script");
            script.id = SCRIPT_ID;
            script.type = "application/ld+json";
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(payload);

        return () => {
            script?.remove();
        };
    }, []);

    return null;
}
