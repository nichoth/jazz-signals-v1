import { FunctionComponent } from 'preact'
import { JSX } from 'preact/jsx-runtime'

interface Props extends Partial<JSX.HTMLAttributes<HTMLInputElement>> {
    name:string;
    displayName:string;
}

export function TextInput (props:Props):FunctionComponent {
    const { name, displayName } = props
    const _props:Partial<Props> = { ...props }
    delete _props.displayName

    return (<div className={'input-group ' + name}>
        <input {..._props}
            name={name}
            type={props.type || 'text'}
            placeholder=" " required={props.required}
            minLength={props.minLength}
            maxLength={props.maxLength}
            id={name}
        />
        <label htmlFor={name}>{displayName}</label>
    </div>)
}
