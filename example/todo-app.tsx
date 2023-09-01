import { FunctionComponent } from 'preact'
import { LocalNode, CoID, CoMap } from 'cojson'
import { useEffect, useState } from 'preact/hooks'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import { Signal, useSignal } from '@preact/signals'
import { localAuth, AuthStatus } from '../src/index.jsx'
import { Login } from './login.jsx'
import './todo-app.css'

type TaskContent = { done: boolean; text: string };
type Task = CoMap<TaskContent>;
type TodoListContent = {
    title: string;
    [taskId: CoID<Task>]: true;  // other keys form a set of task IDs
}
type TodoList = CoMap<TodoListContent>

export function TodoApp ({
    appName,
    syncAddress,
    appHostName
}):FunctionComponent<{
    appName:string
    syncAddress?:string
    appHostName:string
}> {
    const authStatus:Signal<AuthStatus> = useSignal({ status: null })
    const localNode:Signal<LocalNode|null> = useSignal(null)

    // @ts-ignore
    window.authStatus = authStatus

    useEffect(() => {
        const done = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            syncAddress,
        })

        return done
    }, [appName, appHostName, syncAddress])

    const [listId, setListId] = useState<CoID<TodoList>>()

    console.log('render', authStatus.value, localNode.value)

    useEffect(() => {
        if (!localNode.value) return
        window.addEventListener('hashchange', listener)
        listener()

        async function listener () {
            console.log('hash change', localNode.value)
            if (!localNode.value) return
            const acceptedInvitation =
                await consumeInviteLinkFromWindowLocation(localNode.value)

            if (acceptedInvitation) {
                setListId(acceptedInvitation.valueID as CoID<TodoList>)
                window.location.hash = acceptedInvitation.valueID
                return
            }

            setListId(window.location.hash.slice(1) as CoID<TodoList>)
        }

        return () => {
            window.removeEventListener('hashchange', listener)
        }
    }, [localNode.value])

    const signedIn = isSignedIn(authStatus, localNode)

    function logout (ev) {
        ev.preventDefault()
        console.log('logout')
        // @ts-ignore
        authStatus.value.logOut()
    }

    return (<div className={signedIn ? 'signed-in' : 'not-signed-in'}>
        <h1>{appName}</h1>

        {signedIn ?
            (<div>
                signed in, this is the app
                <div>
                    <button onClick={logout}>logout</button>
                </div>
            </div>) :
            (<Login authStatus={authStatus} />)
        }
    </div>)
}

function isSignedIn (
    authStatus:Signal<AuthStatus|null>,
    localNode:Signal<LocalNode|null>
):boolean {
    // @ts-ignore
    return (localNode.value && authStatus.value.logOut)
}
