import { FunctionComponent } from 'preact'
import { CloseBtn } from './close-btn.jsx'
import { GreenCheck } from './green-check.jsx'
import './toast.css'

type ToastType = 'success'|'error'

interface Props {
    onClose: (MouseEvent) => void
    type: ToastType
}

export const Toast:FunctionComponent<Props> = function Toast (props) {
    return (<div className="toast">
        <div className="toast-body">
            {props.type === 'success' ?
                (<>
                    <span class="green-check">
                        <GreenCheck />
                    </span>
                    <span className="toast-children">{props.children}</span>
                </>) :
                <span>{props.children}</span>
            }
        </div>

        <CloseBtn onClick={props.onClose} />
    </div>)
}
