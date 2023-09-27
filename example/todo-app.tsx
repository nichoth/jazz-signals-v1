import { FunctionComponent } from 'preact'
import { LocalNode } from 'cojson'
import { useCallback, useEffect, useMemo } from 'preact/hooks'
import { Signal } from '@preact/signals'
import { Button } from './components/button.jsx'
import { Events, State } from './state.js'
import Router from './router.jsx'
import './todo-app.css'
import {
    localAuth,
    AuthStatus,
    SignedInStatus,
} from '../src/index.js'

const evs = Events.root

/**
 * The top level view component. This is always rendered.
 *   - Setup routing
 *   - Parse invitations
 *   - redirect to `/login` if not authed
 */
export const TodoApp:FunctionComponent<{
    appName:string,
    syncAddress?:string,
    appHostName?:string,
    emit:(name:string, data:any) => void,
    state:ReturnType<typeof State>
}> = function TodoApp ({
    appName,
    syncAddress,
    appHostName,
    emit,
    state
}) {
    const router = useMemo(() => Router(), [])

    const {
        authStatus,
        localNode,
        logoutCount,
        routeState,
        routeEvent,
        setRoute,
        next,
        invitation
    } = state

    const signedIn = useMemo(() => {
        return isSignedIn(authStatus, localNode)
    }, [authStatus.value, localNode.value])

    /**
     * Subscribe to route changes. This hears local link clicks as well as
     * calls to `setRoute`.
     */
    useEffect(() => {
        const ev = routeEvent(function onRoute (path) {
            // @ts-ignore
            emit(evs.routeChange, { path, next: null })
        })

        return ev
    }, [])

    /**
     * Handle auth, create a node
     */
    useEffect(() => {
        let unlisten:()=>void = () => null

        localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress,
            invitation
        }).then(_unlisten => {
            unlisten = _unlisten
        })

        // set the route via the browser API
        // (is will trigger an event heard by `routeEvent`, which then sets
        //   the route state in our application)
        if (invitation.value) {
            setRoute(`/id/${invitation.value.valueID}`)
        }

        return () => unlisten()
    }, [appName, appHostName, syncAddress, logoutCount.value])

    /**
     * redirect if not authed
     */
    useEffect(() => {
        if (!signedIn) {
            if (location.pathname === '/login') return
            setRoute('/login')
        } else {
            setRoute(next.value || '/')
        }
    }, [localNode.value, state.authStatus.value])

    console.log('render', routeState.value)

    const match = router.match(routeState.value)
    const Element = match.action(match, emit)

    return (<div className={'todo-app ' + (signedIn ? 'signed-in' : 'not-signed-in')}>
        <h1>{appName}</h1>
        <Element {...state} params={match.params} />
        <LogoutControl isSignedIn={signedIn} emit={emit} />
    </div>)
}

function LogoutControl ({ isSignedIn, emit }:{
    isSignedIn:boolean,
    emit:(name, data)=>void
}):FunctionComponent {
    const logout = useCallback(() => {
        // @ts-ignore
        emit(evs.logout, null)
    }, [emit])

    return (isSignedIn ?
        (<div className="logout">
            <Button
                isSpinning={false}
                onClick={logout}
            >
                Log Out
            </Button>
        </div>) :
        null)
}

function isSignedIn (
    authStatus:Signal<AuthStatus>,
    localNode:Signal<LocalNode|null>
):boolean {
    return (!!localNode.value && !!(authStatus.value as SignedInStatus).logOut)
}
