import { render } from 'preact'
import { LocalAuth } from '../src/auth-local'
import { TodoApp } from './todo-app'

// import { CoMap, CoID } from 'cojson'

// type TaskContent = { done: boolean; text: string };
// type Task = CoMap<TaskContent>;
// type TodoListContent = {
//     title: string;
//     // other keys form a set of task IDs
//     [taskId: CoID<Task>]: true;
// }
// type TodoList = CoMap<TodoListContent>

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

render(<TodoApp
    syncAddress={
        new URLSearchParams(window.location.search).get('sync') || undefined
    }
    auth={LocalAuth({
        appName: 'Jazz + Preact Todo List Example',
        Component: PrettyAuthComponent,
    })}
/>, document.getElementById('root')!)
