import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useState } from 'preact/hooks'
import { Events, Invitation } from '../state.js'
import { Button } from '../components/button.jsx'
import { TextInput } from '../components/text-input.jsx'
import { AuthStatus } from '../../src/index.jsx'
import '../components/button.css'
import '../components/text-input.css'
import './login.css'
import { Divider } from '../components/divider.jsx'
const evs = Events.login

/*
   type AuthStatus = {
        status: null;
    } | {
        status: 'loading';
    } | {
        status: 'ready';
        logIn: () => void;
        signUp: (username: string) => void;
    } | {
        status: 'signedIn';
        logOut: () => void;
    }
 */

export const Login:FunctionComponent<{
    authStatus: Signal<AuthStatus|null>;
    invitation: Signal<Invitation|null>;
    setRoute:(path:string)=>void;
    next:Signal<string>;
    emit:(name:string, data:any)=>void
}> = function Login ({ authStatus, emit, next }) {
    const [isValid, setValid] = useState(false)

    if (authStatus.value && authStatus.value.status === 'loading') {
        return (<div className="loading">
            loading...
        </div>)
    }

    // need this because `onInput` event doesnt work for cmd + delete event
    async function onFormKeydown (ev:KeyboardEvent) {
        const key = ev.key
        const { form } = ev.target as HTMLInputElement
        if (!form) return
        if (key !== 'Backspace' && key !== 'Delete') return

        const _isValid = (form.checkValidity())
        if (_isValid !== isValid) setValid(_isValid)
    }

    function handleInput (ev) {
        const { form } = ev.target as HTMLInputElement
        const _isValid = (form as HTMLFormElement).checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    async function handleFormClick (ev:MouseEvent) {
        ev.preventDefault()

        try {
            const { type } = (ev.target as HTMLButtonElement).dataset
            if (!type) return

            if (type === 'login') {
                // @ts-ignore
                return emit(evs.login, next.value)
            }

            // type must be 'create'
            const username = ((ev.target as HTMLButtonElement).form!.elements
                .namedItem('username') as HTMLInputElement).value

            // @ts-ignore
            emit(evs.createAccount, { username })
        } catch (err) {
            console.log('errrrr', err)
        }
    }

    return (authStatus.value && authStatus.value.status === 'ready') ?
        (<div className="ready">
            <h2>Login</h2>

            <form id="login-form" onInput={handleInput}
                onClick={handleFormClick}
                onKeydown={onFormKeydown}
            >
                <TextInput minLength={3} displayName="Display name"
                    name="username"
                    required={true}
                    autoComplete="webauthn"
                />
                <div className="control">
                    <h3>Create a new account</h3>
                    <Button isSpinning={false}
                        data-type="create"
                        disabled={!isValid}
                    >
                        Create account
                    </Button>
                </div>

                <Divider text="or" />

                <div className="control login">
                    <h3>Login with an existing account</h3>
                    <Button isSpinning={false} disabled={false}
                        data-type="login"
                    >
                        Login
                    </Button>
                </div>
            </form>
        </div>) :
        null
}
