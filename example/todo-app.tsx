import { FunctionComponent } from 'preact'
import { LocalNode } from 'cojson'
import { useCallback, useEffect, useMemo } from 'preact/hooks'
import { Signal } from '@preact/signals'
import { Button } from './components/button.jsx'
import { Events, State } from './state.js'
import {
    localAuth,
    AuthStatus,
    SignedInStatus,
} from '../src/index.js'
import Router from './router.jsx'
import './todo-app.css'

const evs = Events.root

/**
 * The top level view component
 *   - Setup routing
 *   - redirect to `/login` if not authed
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

    /**
     * localNode and auth state
     */
    const {
        authStatus,
        localNode,
        logoutCount,
        routeState,
        routeEvent,
        setRoute,
        invitation
    } = state

    const signedIn = useMemo(() => {
        return isSignedIn(authStatus, localNode)
    }, [authStatus.value, localNode.value])

    /**
     * Listen for route changes
     */
    useEffect(() => {
        return routeEvent(function onRoute (path) {
            routeState.value = path
        })
    }, [])

    /**
     * create a local node
     */
    useEffect(() => {
        let _unlisten:()=>void = () => null

        localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress,
            invitation
        }).then(unlisten => {
            _unlisten = unlisten
        })

        if (invitation.value) {
            console.log('invitation valueeeeeeee', invitation.value)
            setRoute(`/id/${invitation.value.valueID}`)
        }

        return _unlisten
    }, [appName, appHostName, syncAddress, logoutCount.value])

    /**
     * redirect if not authd
     */
    useEffect(() => {
        console.log('signed in', signedIn)
        if (!signedIn && !invitation.value) {
            if (location.pathname === '/login') return
            setRoute('/login')
        }
    }, [localNode.value])

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
