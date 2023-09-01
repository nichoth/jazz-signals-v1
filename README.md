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
A function `localAuth` that helps with authentication.
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

### localAuth
```ts
function localAuth (appName:string, appHostname:string|undefined,
    opts:LocalAuthState):() => void
```

This will create a new `BrowserLocalAuth`, and subscribe the passed in signals to its events. The return value is a function that will unsubscribe from the `BrowserLocalAuth`. See [the example](https://github.com/nichoth/jazz-signals/blob/main/example/todo-app.tsx#L33) for a demonstration of how the unsubscribe function can be used.

## example
See an example of an application that consumes this package in the [example directory](https://github.com/nichoth/jazz-signals/tree/main/example).

```ts
import { localAuth, AuthStatus, SignedInStatus } from '@nichoth/jazz-signals'

function MyPreactComponent ({ appName, syncAddress, appHostName }) {
    const { authStatus, localNode, logoutCount } = localAuth.createState()

    useEffect(() => {
        const done = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress
        })

        return done
    }, [appName, appHostName, syncAddress, logoutCount.value])
}
```
