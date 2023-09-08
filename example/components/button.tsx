import { JSX } from 'preact/jsx-runtime'
import { FunctionComponent } from 'preact'

interface Props extends Partial<JSX.HTMLAttributes<HTMLButtonElement>> {
    isSpinning:boolean;
}

export function Button (props:Props):FunctionComponent {
    const cl = (props.className ?
        'btn ' + props.className :
        'btn')

    return (<span className="btn-wrapper">
        {props.isSpinning ?
            (<button {...props} disabled="true" className={cl + ' spinning'}>
                {props.children}
            </button>) :
            <button {...props} className={cl}>{props.children}</button>
        }
    </span>)
}
