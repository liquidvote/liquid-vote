import React, { FunctionComponent } from 'react';
import { Helmet } from "react-helmet";

import './style.sass';

export const MetaTags: FunctionComponent<{
    title?: string,
    description?: string,
    image?: string,
    url?: string
}> = ({
    title,
    description,
    image,
    url
}) => {
        return (
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />

                <meta property="og:title" content={`${title || 'Liquid Vote'}`} />
                <meta property="og:description" content={`${description}`} />
                <meta property="og:image" content={`${image || `//https://images.liquid-vote.com/system/logo.png`}`} />
                <meta property="og:url" content={`${url || window.location.href}`} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="og:type" content="website" />
                {/* <meta name="fb:app_id" content={facebook.appId} /> */}

            </Helmet>
        );
    }

