# jazz signals

Need to make a function that will return an object with signals that are connected properly.

```ts
// need a function `LocalAuth`
// takes a few things, and returns a view component.
// Either one that you pass in or a default one
export function LocalAuth({
    appName,
    appHostname,
    Component = LocalAuthBasicUI,  // <-- a react component
}: {
    appName: string;
    appHostname?: string;
    Component?: LocalAuthComponent;
}): ReactAuthHook

// -------

export type LocalAuthComponent = (props: {
    loading: boolean;
    logIn: () => void;
    signUp: (username: string) => void;
}) => ReactNode;

// -------

// that returns a `ReactAuthHook`. Which is
export type ReactAuthHook = () => {
    auth: AuthProvider;
    AuthUI: React.ReactNode;
    logOut?: () => void;
};
```

Make a preact component
The examples, `WithJazz` and `useJazz`, just make it easier to use in a React environment.

What does it do?
* Makes it easier to use Jazz.
* Sets up auth

What does it give you via the `useJazz` hook?
* `useJazz` gives you `{ localNode, logOut }`

`useTelepathicState` hook
* `useTelepathicState` depends on calling `WithJazz` so we have context.

```js
import { useJazz } from 'jazz-react`
```

```ts
// export function LocalAuth({
//     appName,
//     appHostname,
//     Component = LocalAuthBasicUI,  // <-- a react component
// }: {
//     appName: string;
//     appHostname?: string;
//     Component?: LocalAuthComponent;
// }): ReactAuthHook
```

`useTelepathicState` is a function that returns a `useState` hook instance.

In `useTelepathicState` we call
```js
// we use the `useJazz` hook
const { localNode } = useJazz()

// this means we get the `localNode` from the context object
```

* requires a `localNode` instance

`useTelepathicState` depends on a `localNode` instance. We pass `localNode` as a dependency to the `useEffect` hook. Also pass an `id`, which we use to get the `locaNode`. So `id` may change, or also `localNode` may change.

-------

In a `useEffect` hook, we call `localNode.load`. Get `localNode` from context,
read it in the `useJazz` hook.

-------

`useTelepathicState` only depends on an `id` for `cojson`.
