# jazz signals
An example of [Jazz](https://jazz.tools/) + [preact signals](https://preactjs.com/blog/introducing-signals/).

## develop
Start a local vite server

```bash
npm start
```

## example
See an example of an application that consumes this package in the `example` directory.

## API

### localAuth
This exposes a function `localAuth` that handles authentication.

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

