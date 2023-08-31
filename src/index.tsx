// import { render, JSX, Component, FunctionComponent } from 'preact'
// import { TodoApp } from './todo-app'
// import { useEffect, useState } from 'preact/hooks'
import {
    // consumeInviteLinkFromWindowLocation,
    // AuthProvider,
    createBrowserNode
} from 'jazz-browser'
import { BrowserLocalAuth } from 'jazz-browser-auth-local'
import { useMemo } from 'preact/hooks'
import { signal, Signal } from '@preact/signals'

// import {
//     LocalNode,
//     ContentType,
//     CoID,
//     ProfileContent,
//     CoMap,
//     AccountID,
//     Profile,
// } from 'cojson'
import { ContentType, CoID, LocalNode } from 'cojson'

// type TaskContent = { done: boolean; text: string };
// type Task = CoMap<TaskContent>;
// type TodoListContent = {
//     title: string;
//     // other keys form a set of task IDs
//     [taskId: CoID<Task>]: true;
// }
// type TodoList = CoMap<TodoListContent>

/**
 * We don't want the format of `useX`. We want to disentangle the dependencies
 * of the various functions.
 */

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

/**
 * What does the auth example do?
 * shows either an auth component, or the app, depending on if you are
 * logged in or not.
 *
 * Can we separate the state from the UI rendering logic?
 * That means the "authSignal" just tracks if we are logged in or not
 * The rendering logic is implemented by the application
 *
 * What needs to happen when you call `auth`?
 *
 * Need to write in the app the login events.
 *   * now I am logged in
 *   * now I am logged out
 *   * or just pass the login event, and the library handles things
 */

/**
 * Need to look at the `AuthProvider`
 *
 *  export interface AuthProvider {
        createNode(
            getSessionFor: SessionProvider,
            initialPeers: Peer[]
        ): Promise<LocalNode>;
    }
 *
 * Has a single fn, `createNode`, which creates a Jazz node, not a react node.
 *
 * CreateNode calls `sessionProvider`
 * `sessionProvider` is a method on `AuthProvider`
 */

/**
 * `sessionProvider` is a function that takes an `accountID`, which is a `cojson` type
 * returns a `SessionID`, part of `cojson`.
 */

/**
 * `WithJazz` calls `createBrowserNode` in a `useEffect` hook.
 */

/**
 * look at ReactAuthHook.auth
 * = authProvider
 */

/**
 * LocalAuth returns a ReactAuthHook
 * which is a function that returns { auth, authUI, logout }
 */

// type AuthStatus = Signal<
//     | { status: 'loading' }
//     | {
//         status: 'ready';
//         logIn: () => void;
//         signUp: (username: string) => void;
//     }
//     | { state: 'signedIn'; logOut: () => void }
// >

type AuthStatus = { status: 'loading' }
    | {
        status: 'ready';
        logIn: () => void;
        signUp: (username: string) => void;
    }
    // | { status: 'signedIn' }
    | { status: 'signedIn'; logOut: () => void }

/**
 * Fills the place of `useJazz` in the react example.
 * Use this to get a `localNode`.
 */
export function localAuthSignals (appName:string, appHostname?:string, opts?:{
    syncAddress?:string
}):({
    authStatus:Signal<AuthStatus>,
    localNode:Signal<LocalNode|null>
}) {
    const authStatus:Signal<AuthStatus> = signal({ status: 'loading' })
    const localNode:Signal<LocalNode|null> = signal(null)
    const logoutCount:Signal<number> = signal(0)
    const { syncAddress } = (opts || {})

    const localAuth = useMemo(() => {
        return new BrowserLocalAuth(
            {
                onReady (next) {
                    console.log('on ready...', authStatus.value.status)
                    if (authStatus.value.status !== 'ready') {
                        console.log('...set to ready')
                        authStatus.value = {
                            status: 'ready',
                            logIn: next.logIn,
                            signUp: next.signUp,
                        }
                    }
                },

                onSignedIn (next) {
                    if (authStatus.value.status !== 'signedIn') {
                        authStatus.value = {
                            status: 'signedIn',
                            logOut: () => {
                                next.logOut()
                                authStatus.value = { status: 'loading' }
                                logoutCount.value = (logoutCount.value + 1)
                            },
                        }
                    }
                },
            },

            appName,
            appHostname
        )
    }, [appName, appHostname, logoutCount.value])

    createBrowserNode({
        auth: localAuth,
        syncAddress
    }).then(nodeHandle => {
        localNode.value = nodeHandle.node
    }).catch(err => {
        console.log('errrrrrrrrrr', err)
    })

    console.log('local node', localNode.value)

    return {
        authStatus,
        localNode
    }
}

// export async function localNode (syncAddress:string) {
//     const nodeHandle = await createBrowserNode({
//         auth: localAuth,
//         syncAddress,
//     })
// }

/**
 * What consumes the authHook?
 * it is comsumed by `WithJazz`, the context, because we pass an `auth=LocalAuth(...)`
 * to it
 *
 * `LocalAuth` returns `ReactAuthHook`
 * `ReactAuthHook` is a fn that returns an object:
 * type ReactAuthHook = () => {
        auth: AuthProvider;
        AuthUI: React.ReactNode;
        logOut?: () => void;
    };
 *
 * it is React specific because the AuthUI field is a React component
 *
 * We need a LocalAuth fn that is not for React.
 */

// export type AuthHook = () => {
//     auth: AuthProvider;
//     AuthUI:
//     logOut?: () => void;
// }

//
// need to get localNode, it's used by `useTelepathicState`
//  `localNode` is returned by `useJazz`
//   `useJazz` returns the JazzContext
//
// localNode type is imported from `cojson`
//

/**
 * type JazzContext = {
        localNode: LocalNode;
        logOut: () => void;
    };
 */

/**
 * `node` is originally set in a `useEffect` call
 *   that depends on `[auth, syncAddress]`
 * (it's just set as component state)
 *
 * we get `auth` from the call to `WithJazz` -- it's passed as a parameter
 *   in the example we pass it { auth: reactJazzLocalAuth }
 */

/**
 * `WithJazz` makes a call to `useEffect`, and in that call, we set
 * a state object `node`
 *
 * Then we call `useJazz`, and it returns the `localNode` that was
 * set by `WithJazz`.
 *
 * `WithJazz` sets the `value` in the context
 *   `<JazzContext.Provider value={{ localNode: node, logOut }}>`
 */

// render(<TodoApp
//     syncAddress={
//         new URLSearchParams(window.location.search).get('sync') || undefined
//     }
//     auth={LocalAuth({
//         appName: 'Jazz + Preact Todo List Example',
//         Component: PrettyAuthComponent,
//     })}
// />, document.getElementById('root')!)

/**
 * we pass `the result of LocalAuth()` to `WithJazz`
 * like `auth={LocalAuth(...)}`
 *
 * `createBrowserNode` takes `authHook().auth`
 */
