import { createBrowserNode } from 'jazz-browser'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { signal, Signal, effect, computed } from '@preact/signals'
import { LocalNode, CoID, CoValueImpl } from 'cojson'

/**
 * Create a signal for telepathic state
 */
export function telepathicSignal<T extends CoValueImpl> ({
    id,
    localNode
}:{
    id?:CoID<T>,
    localNode:Signal<LocalNode|null>
}):Signal<(T & { done:(()=>void)|null })|null> {
    const doneSignal:Signal<(()=>void)|null> = signal(null)

    const state:Signal<T & { done:(()=>void)|null }|null> = computed(() => {
        if (!doneSignal.value || !localNode.value || !id) return null

        state.value = { ...state.value, done: doneSignal.value }
    })

    effect(() => {
        if (!id || !localNode.value) return

        localNode.value.load(id).then(node => {
            const unsubscribe = node.subscribe(newState => {
                console.log('Got update', id, newState.toJSON())
                state.value = { ...newState as T, done: null }
            })
            doneSignal.value = unsubscribe
        })
    })

    return state
}

export type LoadingStatus = { status: 'loading' }
export type ReadyStatus = {
    status: 'ready';
    logIn: () => void;
    signUp: (username:string) => Promise<void>;
}
export type SignedInStatus = {
    status: 'signedIn';
    logOut: () => void;
}
export type AuthStatus = { status:null } |
    LoadingStatus |
    ReadyStatus |
    SignedInStatus

export interface LocalAuthState {
    authStatus:Signal<AuthStatus>;
    localNode:Signal<LocalNode|null>;
    logoutCount:Signal<number>;
    syncAddress?:string;
}

/**
 * Fills the place of `useJazz` in the react example.
 * Use this to get a `localNode`.
 *
 * We pass in signals and mutate their values, return a function
 * to unsubscribe
 */
function localAuth (appName:string, appHostname:string|undefined,
    opts:LocalAuthState)
:() => void {
    const { syncAddress, localNode, authStatus, logoutCount } = opts

    const localAuthObj = new BrowserLocalAuth(
        {
            onReady (next) {
                authStatus.value = {
                    status: 'ready',
                    logIn: next.logIn,
                    signUp: next.signUp,
                }
            },

            onSignedIn (next) {
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

    let _done:(() => void)|undefined

    createBrowserNode({
        auth: localAuthObj,
        syncAddress
    }).then(nodeHandle => {
        localNode.value = nodeHandle.node
        _done = nodeHandle.done
    }).catch(err => {
        console.log('error creating browser node...', err)
    })

    return function done () {
        if (!_done) throw new Error('Called `done` before it exists')
        _done()
    }
}

localAuth.createState = function ():LocalAuthState {
    const authStatus:Signal<AuthStatus> = signal({ status: null })
    const localNode:Signal<LocalNode|null> = signal(null)
    const logoutCount:Signal<number> = signal(0)

    return { authStatus, localNode, logoutCount }
}

export { localAuth }
