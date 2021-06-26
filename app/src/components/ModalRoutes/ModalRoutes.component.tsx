import React, { FunctionComponent } from 'react';
import Modal from 'react-modal';
import loadable from '@loadable/component';
import { ErrorBoundary } from 'react-error-boundary';

import useSearchParams from "@state/Global/useSearchParams.effect";

import './style.sass';

const AsyncPage = loadable(
    (props: any) => import(`@components/ModalRoutes/modals/${props.modalTitle}`), {
    cacheKey: props => props.modalTitle,
});

export const ModalRoutes: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, updateParams } = useSearchParams();

    Modal.setAppElement('#app')

    return (
        <Modal
            isOpen={!!allSearchParams.modal}
            // onAfterOpen={afterOpenModal}
            onRequestClose={() => updateParams({ keysToRemove: ['modal', 'modalData'] })}
            // style={customStyles}
            // contentLabel="Example Modal"
            className="Modal"
            overlayClassName="Overlay"
        // appElement={document.querySelector('#app')}
        >
            <>
                {!!allSearchParams.modal && (
                    <ErrorBoundary
                        FallbackComponent={() =>
                            <>Error</>
                        }
                        onError={(err) => {
                            console.log({ err });
                            updateParams({ keysToRemove: ['modal', 'modalData'] })
                        }}
                    >
                        <AsyncPage modalTitle={allSearchParams.modal} />
                    </ErrorBoundary>
                )}
            </>
        </Modal>
    );
}

