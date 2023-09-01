import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useState } from 'preact/hooks'
import { Button } from './components/button.jsx'
import { TextInput } from './components/text-input.jsx'
import { AuthStatus, ReadyStatus } from '../src/index.jsx'
import './components/button.css'
import './components/text-input.css'
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

export function Login ({ authStatus }:{
    authStatus: Signal<AuthStatus|null>
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

    async function handleFormClick (ev:MouseEvent) {
        ev.preventDefault()

        try {
            const { type } = (ev.target as HTMLButtonElement).dataset
            if (!type) return

            if (type === 'login') {
                await (authStatus.value as ReadyStatus).logIn()
            }

            // type must be 'create'
            // get the username
            const username = ((ev.target as HTMLButtonElement).form!.elements
                .namedItem('username')! as HTMLInputElement).value

            await (authStatus.value as ReadyStatus).signUp(username)
        } catch (err) {
            console.log('errrrr', err)
        }
    }

    return (authStatus.value && authStatus.value.status === 'ready') ?
        (<div className="ready">
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
                    <Button isSpinning={false}
                        data-type="create"
                        disabled={!isValid}
                    >
                        Create a new account
                    </Button>
                </div>
                <div className="control">
                    <Button isSpinning={false} disabled={false}
                        data-type="login"
                    >
                        Login with an existing account
                    </Button>
                </div>
            </form>
        </div>) :
        null
}

// import { AnyComponent } from 'preact'
// import { useState, useMemo } from 'preact/hooks'
// import { BrowserLocalAuth } from 'jazz-browser-auth-local'
// import { AuthProvider } from 'jazz-browser'

// export type LocalAuthComponent = (props: {
//     loading: boolean;
//     logIn: () => void;
//     signUp: (username: string) => void;
// }) => AnyComponent

// export type PreactAuthHook = () => {
//     auth: AuthProvider;
//     AuthUI: AnyComponent;
//     logOut?: () => void;
// }

// export function LocalAuth ({
//     appName,
//     appHostname,
//     Component = LocalAuthBasicUI,
// }:{
//     appName:string;
//     appHostname?:string;
//     Component?:LocalAuthComponent;
// }):PreactAuthHook {
//     return function useLocalAuth () {
//         const [authState, setAuthState] = useState<
//             | { state: 'loading' }
//             | {
//                   state: 'ready';
//                   logIn:() => void;
//                   signUp: (username: string) => void;
//                       }
//                       | { state: 'signedIn'; logOut: () => void }
//                       >({ state: 'loading' })

//         const [logOutCounter, setLogOutCounter] = useState(0)

//         const auth = useMemo(() => {
//             return new BrowserLocalAuth(
//                 {
//                     onReady (next) {
//                         setAuthState({
//                             state: 'ready',
//                             logIn: next.logIn,
//                             signUp: next.signUp,
//                         })
//                     },
//                     onSignedIn (next) {
//                         setAuthState({
//                             state: 'signedIn',
//                             logOut: () => {
//                                 next.logOut()
//                                 setAuthState({ state: 'loading' })
//                                 setLogOutCounter((c) => c + 1)
//                             },
//                         })
//                     },
//                 },
//                 appName,
//                 appHostname
//             )
//         }, [appName, appHostname, logOutCounter])

//         const AuthUI = (authState.state === 'ready' ?
//             Component({
//                 loading: false,
//                 logIn: authState.logIn,
//                 signUp: authState.signUp,
//             }) :
//             Component({
//                 loading: false,
//                 logIn: () => {},
//                 signUp: () => {},
//             }))

//         return {
//             auth,
//             AuthUI,
//             logOut:
//                 authState.state === 'signedIn' ? authState.logOut : undefined,
//         }
//     }
// }

// const LocalAuthBasicUI = ({
//     logIn,
//     signUp,
// }:{
//     logIn: () => void;
//     signUp: (username: string) => void;
// }) => {
//     const [username, setUsername] = useState<string>('')

//     return (
//         <div
//             style={{
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//             }}
//         >
//             <div
//                 style={{
//                     width: '18rem',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: '2rem',
//                 }}
//             >
//                 <form
//                     style={{
//                         width: '18rem',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '0.5rem',
//                     }}
//                     onSubmit={(e) => {
//                         e.preventDefault()
//                         signUp(username)
//                     }}
//                 >
//                     <input
//                         placeholder="Display name"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         autoComplete="webauthn"
//                         style={{
//                             border: '1px solid #333',
//                             padding: '10px 5px',
//                         }}
//                     />
//                     <input
//                         type="submit"
//                         value="Sign Up as new account"
//                         style={{
//                             background: '#aaa',
//                             padding: '10px 5px',
//                         }}
//                     />
//                 </form>
//                 <button
//                     onClick={logIn}
//                     style={{ background: '#aaa', padding: '10px 5px' }}
//                 >
//                     Log In with existing account
//                 </button>
//             </div>
//         </div>
//     )
// }
