import { FunctionComponent } from 'preact'
import { CoValueImpl, LocalNode, CoID } from 'cojson'
import Route from 'route-event'
import { useEffect, useMemo } from 'preact/hooks'
import { Signal, useSignal } from '@preact/signals'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import {
    localAuth,
    AuthStatus,
    SignedInStatus
} from '../src/index.js'
import './todo-app.css'
import Router from './router.jsx'

/**
 * Setup routing
 * Create a localNode
 * Look at auth
 */

export function TodoApp ({
    appName,
    syncAddress,
    appHostName
}:{
    appName:string,
    syncAddress?:string,
    appHostName?:string
}):FunctionComponent {
    const router = useMemo(() => Router(), [])
    const routeState = useSignal<string>(location.pathname + location.search)
    const currentProjectId = useSignal<string>('')

    /**
     *  Create a localNode and auth state
     */
    const state = useMemo(() => localAuth.createState(), [])
    const { authStatus, localNode, logoutCount } = state

    const signedIn = isSignedIn(authStatus, localNode)

    /**
     * Listen for hash changes
     * This is relevant when you are viewing a project
     * or when you accept an invitation
     *
     * see [this example](https://github.com/gardencmp/jazz/blob/main/examples/todo/src/router.ts#L5)
     */
    useEffect(() => {
        const listener = async () => {
            if (!localNode.value) return
            const acceptedInvitation =
                await consumeInviteLinkFromWindowLocation<CoValueImpl>(
                    localNode.value
                )

            if (acceptedInvitation) {
                currentProjectId.value = acceptedInvitation.valueID
                route.setRoute('/id/' + acceptedInvitation.valueID)
                // window.location.hash = acceptedInvitation.valueID
                return
            }

            currentProjectId.value = (window.location.hash
                .slice(1) as CoID<CoValueImpl> || null)
        }

        window.addEventListener('hashchange', listener)
        listener()

        return () => {
            window.removeEventListener('hashchange', listener)
        }
    }, [localNode.value])

    /**
     * Listen for route changes
     */
    const route = useMemo(() => Route(), [])
    useEffect(() => {
        return route(function onRoute (path) {
            routeState.value = path
        })
    }, [])

    /**
     *  - instantiate a local node
     *  - redirect to `/login` if not authd
     */
    useEffect(() => {
        const unlisten = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress
        })

        if (authStatus.value.status !== 'signedIn') {
            if (location.pathname === '/login') return unlisten
            route.setRoute('/login')
        }

        return unlisten
    }, [appName, appHostName, syncAddress, logoutCount.value])

    console.log('render', authStatus.value, localNode.value, logoutCount.value)

    // @ts-ignore
    window.authStatus = authStatus

    function logout (ev) {
        ev.preventDefault()
        console.log('logout');
        (authStatus.value as SignedInStatus).logOut()
    }

    const match = router.match(routeState.value)
    const Element = match.action(match)

    console.log('ellll', Element)

    return (<div className={'todo-app' + (signedIn ? 'signed-in' : 'not-signed-in')}>
        <h1>{appName}</h1>
        <Element setRoute={route.setRoute} logout={logout} {...state}
            params={match.params}
        />
    </div>)
}

function isSignedIn (
    authStatus:Signal<AuthStatus>,
    localNode:Signal<LocalNode|null>
):boolean {
    return (!!localNode.value && !!(authStatus.value as SignedInStatus).logOut)
}

// function ListControls ({ onCreateList }:{
//     onCreateList: (title:string) => void
// }):FunctionComponent {
//     const [isValid, setValid] = useState(false)

//     function submit (ev) {
//         ev.preventDefault()
//         const { title } = ev.target.elements
//         onCreateList(title.value)
//     }

//     // need this because `onInput` event doesnt work for cmd + delete event
//     async function onFormKeydown (ev:KeyboardEvent) {
//         const key = ev.key
//         const { form } = ev.target as HTMLInputElement
//         if (!form) return
//         if (key !== 'Backspace' && key !== 'Delete') return

//         const _isValid = (form.checkValidity())
//         if (_isValid !== isValid) setValid(_isValid)
//     }

//     function handleInput (ev) {
//         const { form } = ev.target as HTMLInputElement
//         const _isValid = (form as HTMLFormElement).checkValidity()
//         if (_isValid !== isValid) setValid(_isValid)
//     }

//     return (<form className="list-controls" onSubmit={submit}
//         onInput={handleInput}
//         onKeydown={onFormKeydown}
//     >
//         <TextInput minLength={3} displayName="List name"
//             name="title"
//             required={true}
//         />

//         <div className="control">
//             <Button isSpinning={false}
//                 disabled={!isValid}
//             >
//                 Create a new todo list
//             </Button>
//         </div>
//     </form>)
// }

// function TodoListEl ({ list }:{
//     list:Signal<ListOfTasks|null>
// }):FunctionComponent|null {
//     console.log('list', list?.value)
//     if (!list.value) return null

//     return (<div className="todo-list">
//         <ul className="todo-list">
//             <li>list</li>
//         </ul>
//     </div>)
// }
