import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useEffect, useState } from 'preact/hooks'
import { Button } from '../components/button.jsx'
import { TextInput } from '../components/text-input.jsx'
import { AuthStatus, ReadyStatus } from '../../src/index.jsx'
import '../components/button.css'
import '../components/text-input.css'
import './login.css'

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

// Login.Events = (['login']).reduce((acc, name) => {
//     acc[name] = name
//     return acc
// }, {})

Login.Events = ['login']

export function Login ({ authStatus, setRoute, emit }:{
    authStatus: Signal<AuthStatus|null>;
    setRoute:(path:string) => void;
    emit:{ (name, data):void, events:Record<string, string> }
}):FunctionComponent {
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

    useEffect(() => {
        if (authStatus.value?.status === 'signedIn') {
            setRoute('/')
        }
    }, [authStatus.value])

    async function handleFormClick (ev:MouseEvent) {
        ev.preventDefault()

        try {
            const { type } = (ev.target as HTMLButtonElement).dataset
            if (!type) return

            if (type === 'login') {
                emit(emit.events.login, null)
                // return await (authStatus.value as ReadyStatus).logIn()
            }

            // type must be 'create'
            const username = ((ev.target as HTMLButtonElement).form!.elements
                .namedItem('username') as HTMLInputElement).value

            await (authStatus.value as ReadyStatus).signUp(username)

            setRoute('/')
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

                <div className="divider">
                    <span>or</span>
                    <hr />
                </div>

                <div className="control login">
                    <h3>Login with an existing account</h3>
                    <Button isSpinning={false} disabled={false}
                        data-type="Login"
                    >
                        Login
                    </Button>
                </div>
            </form>
        </div>) :
        null
}
