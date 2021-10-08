import { useState, useEffect } from 'react';
import { useLocation, useHistory } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";

import { UPLOADURL } from "@state/S3/typeDefs";

export default function useFileUploader() {

    const [getUploadUrl, {
        loading: uploadUrl_loading,
        error: uploadUrl_error,
        data: uploadUrl_data,
    }] = useMutation(UPLOADURL);

    const uploadFile = async ({ file }: { file: File }) => {
        const { data: { UploadURL: { command, url } } } = await getUploadUrl({
            variables: {
                imageType: file.type.replace('image/', '')
            }
        });

        const res = await fetch(url, {
            method: "PUT",
            headers: { 'Content-Type': file.type },
            body: file
        });

        return res?.url
            .replace('s3.eu-west-1.amazonaws.com/', '')
            .split('?')[0];
    };

    return {
        uploadFile
    };
}