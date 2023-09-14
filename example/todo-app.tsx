import { FunctionComponent } from 'preact'
import { CoValueImpl, LocalNode, CoID } from 'cojson'
import Route from 'route-event'
import { useCallback, useEffect, useMemo } from 'preact/hooks'
import { Signal, useSignal } from '@preact/signals'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import { NamespacedEvents } from '@nichoth/events'
import { Button } from './components/button.jsx'
import { Events, State } from './state.js'
import {
    localAuth,
    AuthStatus,
    SignedInStatus
} from '../src/index.js'
import Router from './router.jsx'
import './todo-app.css'

const evs = Events.root

/**
 * The top level view component
 *   - Setup routing
 *   - redirect to `/login` if not authed
 * @returns {FunctionComponent}
 */
export function TodoApp ({
    appName,
    syncAddress,
    appHostName,
    emit,
    state
}:{
    appName:string,
    syncAddress?:string,
    appHostName?:string,
    emit:(name:string, data:any) => void,
    state:ReturnType<typeof State>
}):FunctionComponent {
    const router = useMemo(() => Router(), [])
    const currentProjectId = useSignal<string>('')

    /**
     * localNode and auth state
     * Create a single state top level state object. That's ok because
     * we are using signals here.
     */
    const { authStatus, localNode, logoutCount, route: routeState } = state

    const signedIn = useMemo(() => {
        return isSignedIn(authStatus, localNode)
    }, [authStatus.value, localNode.value])

    /**
     * Listen for hash changes
     * This is relevant when you are viewing an existing project
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
                route.setRoute('/id/#' + acceptedInvitation.valueID)
                // window.location.hash = acceptedInvitation.valueID
                return
            }

            currentProjectId.value = (window.location.hash
                .slice(1) as CoID<CoValueImpl> || null)
        }

        window.addEventListener('hashchange', listener)
        listener()

        return () => window.removeEventListener('hashchange', listener)
    }, [localNode.value])

    /**
     * Listen for route changes
     */
    const route = useMemo(() => Route(), [])
    useEffect(() => {
        return route(function onRoute (path) {
            // emit route events
            // they are handled by the app subscription
            emit((evs as NamespacedEvents).routeChange as string, path)
        })
    }, [])

    /**
     *  - create a local node
     *  - redirect to `/login` if not authed
     */
    useEffect(() => {
        const unlisten = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress
        })

        if (!signedIn) {
            if (location.pathname === '/login') return unlisten
            route.setRoute('/login')
        }

        return unlisten
    }, [appName, appHostName, syncAddress, logoutCount.value])

    console.log('render', authStatus.value, localNode.value, logoutCount.value,
        routeState.value)

    const match = router.match(routeState.value)
    const Element = match.action(match, emit)

    return (<div className={'todo-app ' + (signedIn ? 'signed-in' : 'not-signed-in')}>
        <h1>{appName}</h1>
        <Element setRoute={route.setRoute} {...state} params={match.params} />
        <LogoutControl setRoute={route.setRoute} isSignedIn={signedIn}
            emit={emit}
        />
    </div>)
}

function LogoutControl ({ isSignedIn, emit, setRoute }:{
    setRoute:(path:string)=>void
    isSignedIn:boolean,
    emit:(name, data)=>void
}):FunctionComponent {
    const logout = useCallback(() => {
        emit((evs as NamespacedEvents).logout as string, null)
        // setRoute('/login')
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
