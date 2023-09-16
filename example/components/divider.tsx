import { FunctionComponent } from 'preact'
import './divider.css'

export const Divider:FunctionComponent<{
    text?:string
}> = function Divider ({ text }) {
    return (<div className="divider">
        {text ?
            (<span>{text}</span>) :
            (null)
        }
        <hr />
    </div>)
}
