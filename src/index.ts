import { createBrowserNode } from 'jazz-browser'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { signal, Signal, effect } from '@preact/signals'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { Invitation } from '../example/state.js'

/**
 * Create a signal for telepathic state
 */
export function telepathicSignal<T extends CoValueImpl> ({
    id,
    localNode
}:{
    id?:CoID<T>,
    localNode:Signal<LocalNode|null>
}):Signal<[ T|null, (()=>void)|null ]> {
    const state:Signal<[ T|null, (()=>void)|null ]> = signal([null, null])

    const dispose = effect(async () => {
        if (!id || !localNode.value) return

        const node = await localNode.value.load(id)

        const unsubscribe = node.subscribe(newState => {
            state.value = [newState as T, allDone]

            function allDone () {
                unsubscribe()
                dispose()
            }
        })
    })

    return state
}

export async function subscribe<T extends CoValueImpl> (
    id:CoID<T>,
    localNode:LocalNode|null,
    cb:(any)=>any
):Promise<()=>void> {
    if (!id || !localNode) return noop
    const node = await localNode.load(id)
    const unsubscribe = node.subscribe(newState => {
        cb(newState)
    })

    return unsubscribe
}

function noop () {}

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
    invitation:Signal<Invitation|null>;
}

/**
 * Use this to get a `localNode`.
 *
 * We pass in signals and mutate their values, return a function
 * to unsubscribe
 */
async function localAuth (
    appName:string,
    appHostname:string|undefined,
    opts:LocalAuthState
):Promise<() => void> {
    const { syncAddress, localNode, authStatus, logoutCount, invitation } = opts

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

    let _done:(() => void) = done

    const nodeHandle = await createBrowserNode({
        auth: localAuthObj,
        syncAddress
    })

    localNode.value = nodeHandle.node
    _done = nodeHandle.done

    if (invitation.value) {
        const { valueID, inviteSecret } = invitation.value || {}
        if (!valueID || !inviteSecret) throw new Error("can't parse invitation")

        await localNode.value.acceptInvite(valueID, inviteSecret)

        console.log('accepted invite')
        invitation.value = null

        // now need to go to the project

        return done
    }

    return done

    function done () {
        if (!_done) throw new Error('Called `done` before it exists')
        _done()
    }
}

localAuth.createState = function (invitation?:Invitation):LocalAuthState {
    const authStatus:Signal<AuthStatus> = signal({ status: null })
    const localNode:Signal<LocalNode|null> = signal(null)
    const logoutCount:Signal<number> = signal(0)
    const _invitation = signal(invitation || null)

    return { authStatus, localNode, logoutCount, invitation: _invitation }
}

export { localAuth }
