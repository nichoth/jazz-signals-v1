# jazz signals
A library to help use [Jazz](https://jazz.tools/) with [preact signals](https://preactjs.com/blog/introducing-signals/).

## install
```bash
npm i -S @nichoth/jazz-signals
```

## develop
Start a local vite server

```bash
npm start
```

## API
Import a function `localAuth` that helps with authentication, and has a property `createState` that returns observable state. This will create and return a signal of a `localNode`, the object used for persistence/`telepathicState`.

```js
import { localAuth } from '@nichoth/jazz-signals'
```

### localAuth.createState
Create a state object that includes signals.

```ts
export interface LocalAuthState {
    authStatus:Signal<AuthStatus>;
    localNode:Signal<LocalNode|null>;
    logoutCount:Signal<number>;
    syncAddress?:string;
}

localAuth.createState = function ():LocalAuthState
```

The returned state object should be passed into the `localAuth` function. See an example [in the example app](https://github.com/nichoth/jazz-signals/blob/main/example/todo-app.tsx#L27).

The signals returned are plain signals; you [would want to wrap them in a call to `useMemo`](https://preactjs.com/guide/v10/signals/#local-state-with-signals) if you use them in a view component.

### localAuth
```ts
function localAuth (
    appName:string,
    appHostname:string|undefined,
    opts:LocalAuthState
):() => void
```

This will create a new [BrowserLocalAuth](https://github.com/gardencmp/jazz/tree/fe1092ccf639d5cdb5013056d1184a415af826d0/packages/jazz-browser-auth-local), and subscribe the signals passed in as `opts:LocalAuthState` to its events. The return value is a function that will unsubscribe from `BrowserLocalAuth`. See [the example](https://github.com/nichoth/jazz-signals/blob/main/example/todo-app.tsx#L33) for a demonstration of how the unsubscribe function can be used.

To check if you are logged in, look for the `authStatus.value.logout` property. If `.logout` exists, then you are logged in. Call `authStatus.value.signUp` or `authStatus.value.signIn` to handle creating an account and logging in. See [an example of handling auth](https://github.com/nichoth/jazz-signals/blob/main/example/login.tsx#L54).

## example
An example of an application that consumes this package is in the [example directory](https://github.com/nichoth/jazz-signals/tree/main/example).

```js
import { useMemo, useEffect } from 'preact/hooks'
import { localAuth } from '@nichoth/jazz-signals'

function MyPreactComponent ({ appName, syncAddress, appHostName }) {
    const { authStatus, localNode, logoutCount } = useMemo(() => {
        return localAuth.createState()
    }, [])

    useEffect(() => {
        const done = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress
        })

        return done
    }, [appName, appHostName, syncAddress, logoutCount.value])

    // ...
}
```

## API

### localAuth
Create a localNode by mutating the signals that are passed in. A signal, `localNode`, is created by `localNode.createState()`.

You should create a state object first with `localAuth.createState`, then pass the state to `localAuth`.

```js
import { localAuth } from '@nichoth/jazz-signals'
import { useEffect, useMemo } from 'preact/hooks'

function MyComponent ({ appHostName, syncAddress, appName }) {
    const state = useMemo(() => localAuth.createState(), [])
    const { localNode } = state  // <-- a signal for our localNode

    /**
     * Handle auth, create a node
     */
    useEffect(() => {
        let unlisten:()=>void = () => null

        localAuth(appName, appHostName, { ...state }).then(_unlisten => {
            unlisten = _unlisten
        })

        return unlisten
    }, [appName, appHostName, syncAddress, logoutCount.value])
}
```

### telepathicSignal 
```js
import { telepathicSignal } from '@nichoth/jazz-signals'

const mySignal = telepathicSignal({
    id: 'co_zPLDBXZD5UuZtYGzpqAvgAAHhs4',
    localNode
})
```

Create a new signal that is subscribed to any changes from the `cojson`
object referenced by the given `id`.

```jsx
import { telepathicSignal } from '@nichoth/jazz-signals'
import { useMemo } from 'preact/hooks'

function Component () {
    const projectSignal = useMemo(() => {
        return telepathicSignal({
            // get the `id` from the URL or something
            id: 'co_zPLDBXZD5UuZtYGzpqAvgAAHhs4',
            localNode  // <-- here we consume the localNode we created earlier
        })
    }, [params.id, localNode.value])

    const [project] = projectSignal.value

    // get tasks (the list of things to do)
    // this is where we subscribe to task changes
    const tasksSignal = useMemo(() => {
        if (!project) return signal([])
        // we depend on the 'tasks' key existing.
        const tasksId = project.get('tasks')

        return telepathicSignal({ id: tasksId, localNode })
    }, [project, localNode.value])

    const [tasks] = tasksSignal.value

    return (<div>
        <h2>{project.get('title')}</h2>

        <ul className="todo-list">
            {tasks?.map((taskId: CoID<Task>) => {
                // subscribe to each TODO list item
                const [task] = useMemo(
                    () => telepathicSignal<Task>({ id: taskId, localNode }),
                    [taskId, localNode.value]
                ).value

                // The view will re-render when the task updates.
                // This is magically in sync with multiple devices.
                // You can create an invitation for another device, and changes
                // will automatically be visible on both devices.
                return (<li key={taskId}>
                    {task?.get('done') ?
                        (<s>{task.get('text')}</s>) :
                        (<span>{task.get('text')}</span>)
                    }
                </li>)
            })}
        </ul>
    </div>)
}
```
