import React, {
    FunctionComponent,
    forwardRef,
    useState
} from 'react';
import { FieldError } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

import './style.sass';

type Props = {
    // ref: any,
    register: any,
    labelName?: string,
    name: string,
    value: string,
    type?: string,
    error?: FieldError | undefined,
    disabled?: boolean,
    autoFocus?: boolean,
    setValue: any
}

export const ImageInput: FunctionComponent<Props> = ({
    register,
    labelName,
    name,
    value,
    type = 'input',
    error,
    disabled,
    autoFocus,
    setValue
}) => {

    const [image, setImage] = useState('');

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        multiple: false,
        onDrop: acceptedFiles => {
            setImage(URL.createObjectURL(acceptedFiles[0]));
            setValue(name, acceptedFiles[0]);
        }
    });

    const [isFocused, setIsFocused] = useState(false);

    return (
        <>

            <input
                className="d-none"
                {...register}
                name={name}
                type={type || 'input'}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
            />

            <div className={
                `InputWrapper ${value && 'hasValue'} ${error && 'hasError'} ${isFocused && 'isFocused'} pointer`
            }>
                <label>
                    {name}
                </label>

                <div
                    className="inputElementWrapper d-flex img-input-wrapper"
                >

                    <div {...getRootProps({ className: 'dropzone d-flex justify-content-between input-element' })}>
                        <input {...getInputProps()} />
                        <small className="baseColors">Drop your {name} here, or select it</small>
                        {(!!image || (!!value && typeof value === 'string')) && (
                            <img src={image || value} />
                        )}
                    </div>

                </div>
                {error && <div className="error">{(error as any).message}</div>}
            </div>
        </>
    );
};
