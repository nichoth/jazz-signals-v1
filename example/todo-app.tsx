import { FunctionComponent } from 'preact'
import { LocalNode, CoID, CoMap } from 'cojson'
import { useEffect, useState } from 'preact/hooks'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import { Signal, useSignal } from '@preact/signals'
import { localAuth, AuthStatus } from '../src/index.jsx'
import { AuthLocal } from './auth-local.jsx'
import './todo-app.css'

type TaskContent = { done: boolean; text: string };
type Task = CoMap<TaskContent>;
type TodoListContent = {
    title: string;
    [taskId: CoID<Task>]: true;  // other keys form a set of task IDs
}
type TodoList = CoMap<TodoListContent>

export function TodoApp ({ appName, syncAddress, appHostName }:{
    appName:string,
    syncAddress?:string,
    appHostName?:string
}):FunctionComponent<{
    appName:string
    syncAddress?:string
    appHostName:string
}> {
    const authStatus:Signal<AuthStatus> = useSignal({ status: null })
    const localNode:Signal<LocalNode|null> = useSignal(null)

    useEffect(() => {
        localAuth(appName, appHostName, {
            authStatus,
            localNode,
            syncAddress,
        })
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

    return (<div className={signedIn ? 'signed-in' : 'not-signed-in'}>
        <h1>{appName}</h1>

        {isSignedIn(authStatus, localNode) ?
            <div>signed in</div> :
            (<span>
                <AuthLocal
                    isResolving={(!!authStatus.value &&
                        authStatus.value.status === 'loading')}
                    authStatus={authStatus}
                />
            </span>)
        }
    </div>)
}

function isSignedIn (
    authStatus:Signal<AuthStatus|null>,
    localNode:Signal<LocalNode|null>
) {
    // @ts-ignore
    return (localNode.value && authStatus.value.logOut)
}