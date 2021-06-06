import React, { FunctionComponent } from 'react';
import Modal from 'react-modal';
import loadable from '@loadable/component';
import { ErrorBoundary } from 'react-error-boundary';

import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

const AsyncPage = loadable((props: any) => import(`@components/ModalRoutes/modals/${props.modalTitle}`));

export const ModalRoutes: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();

    return (
        <Modal
            isOpen={!!allSearchParams.modal}
            // onAfterOpen={afterOpenModal}
            onRequestClose={() => updateParams({ keysToRemove: ['modal', 'modalData'] })}
            // style={customStyles}
            // contentLabel="Example Modal"
            className="Modal"
            overlayClassName="Overlay"
            // appElement={'*'}
        >
            <>
                {!!allSearchParams.modal && (
                    <ErrorBoundary
                        FallbackComponent={() =>
                            <>Error</>
                        }
                        onError={() =>
                            updateParams({ keysToRemove: ['modal', 'modalData'] })
                        }
                    >
                        <AsyncPage modalTitle={allSearchParams.modal} />
                    </ErrorBoundary>
                )}
            </>
        </Modal>
    );
}

