import {
    createBrowserNode
} from 'jazz-browser'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { useMemo } from 'preact/hooks'
import { signal, Signal } from '@preact/signals'
import { ContentType, CoID, LocalNode } from 'cojson'

export async function telepathicSignal<T extends ContentType> (
    localNode:LocalNode,
    id?: CoID<T>
):Promise<Signal<T|null>> {
    const state = signal<T|null>(null)
    if (!id) return state

    let node
    try {
        node = await localNode.load(id)
    } catch (err) {
        console.log('Failed to load', id, err)
    }

    node.subscribe(newState => {
        // console.log(
        //     "Got update",
        //     id,
        //     newState.toJSON(),
        // );
        state.value = newState as T
    })

    return state
}

export type AuthStatus = { status: null } |
    ({ status: 'loading' } |
    {
        status: 'ready';
        logIn: () => void;
        signUp: (username: string) => void;
    } |
    {
        status: 'signedIn';
        logOut: () => void;
    })

/**
 * Fills the place of `useJazz` in the react example.
 * Use this to get a `localNode`.
 */
export function localAuth (appName:string, appHostname:string|undefined, opts:{
    syncAddress?:string;
}):{
    authStatus:Signal<AuthStatus>;
    localNode:Signal<LocalNode|null>;
} {
    const authStatus:Signal<AuthStatus> = signal({ status: null })
    const localNode:Signal<LocalNode|null> = signal(null)
    // const authStatus:Signal<AuthStatus> = useSignal({ status: null })
    // const localNode:Signal<LocalNode|null> = useSignal(null)
    // const { authStatus } = opts
    const logoutCount:Signal<number> = signal(0)
    const { syncAddress } = (opts || {})

    // @ts-ignore
    window.authStatus = authStatus

    const localAuth = useMemo(() => {
        return new BrowserLocalAuth(
            {
                onReady (next) {
                    console.log('on ready, status...', authStatus.value)
                    authStatus.value = {
                        status: 'ready',
                        logIn: next.logIn,
                        signUp: next.signUp,
                    }
                },

                onSignedIn (next) {
                    console.log('signed in', authStatus.value)
                    authStatus.value = {
                        status: 'signedIn',
                        logOut: () => {
                            next.logOut()
                            authStatus.value = { status: 'loading' }
                            logoutCount.value = (logoutCount.value + 1)
                        },
                    }
                },
            },

            appName,
            appHostname
        )
    }, [appName, appHostname, logoutCount.value])

    console.log('local auth', localAuth)

    createBrowserNode({
        auth: localAuth,
        syncAddress
    }).then(nodeHandle => {
        localNode.value = nodeHandle.node
    }).catch(err => {
        console.log('errrrrrrrrrr', err)
    })

    return { localNode, authStatus }
}
