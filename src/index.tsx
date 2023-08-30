// import { render, JSX, Component, FunctionComponent } from 'preact'
// import { TodoApp } from './todo-app'
// import { useEffect, useState } from 'preact/hooks'
// import {
//     consumeInviteLinkFromWindowLocation,
//     AuthProvider,
//     createBrowserNode
// } from 'jazz-browser'
import { useSignal, Signal } from '@preact/signals'

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
    const state = useSignal<T|null>(null)
    if (!id) return state

    let node
    try {
        node = await localNode.load(id)
    } catch (err) {
        console.log('Failed to load', id, err)
    }

    node.subscribe((newState) => {
        // console.log(
        //     "Got update",
        //     id,
        //     newState.toJSON(),
        // );
        state.value = newState as T
    })

    return state
}

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
