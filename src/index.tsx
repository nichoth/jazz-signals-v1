import { createBrowserNode } from 'jazz-browser'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
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

export type LoadingStatus = { status: 'loading' }
export type ReadyStatus = {
    status: 'ready';
    logIn: () => void;
    signUp: (username:string) => void;
}
export type SignedInStatus = {
    status: 'signedIn';
    logOut: () => void;
}
export type AuthStatus = { status:null } |
    LoadingStatus |
    ReadyStatus |
    SignedInStatus

/**
 * Fills the place of `useJazz` in the react example.
 * Use this to get a `localNode`.
 *
 * No return value because we pass in the signals. This is a closure, mutates
 * the signal args.
 */
export function localAuth (appName:string, appHostname:string|undefined, opts:{
    authStatus:Signal<AuthStatus>;
    localNode:Signal<LocalNode|null>;
    syncAddress?:string;
}):void {
    const { syncAddress, localNode, authStatus } = opts
    const logoutCount:Signal<number> = signal(0)

    const localAuth = new BrowserLocalAuth(
        {
            onReady (next) {
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

    console.log('local auth', localAuth)

    createBrowserNode({
        auth: localAuth,
        syncAddress
    }).then(nodeHandle => {
        localNode.value = nodeHandle.node
    }).catch(err => {
        console.log('errrrrrrrrrr', err)
    })
}
