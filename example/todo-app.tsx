import { FunctionComponent } from 'preact'
import { LocalNode, CoID, CoMap } from 'cojson'
import { useEffect, useState, useMemo } from 'preact/hooks'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import { Signal } from '@preact/signals'
import { Login } from './login.jsx'
import {
    telepathicSignal,
    localAuth,
    AuthStatus,
    SignedInStatus
} from '../src/index.js'
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
}:{
    appName:string,
    syncAddress?:string,
    appHostName?:string
}):FunctionComponent {
    const [listId, setListId] = useState<CoID<TodoList>>()

    const { authStatus, localNode, logoutCount } = useMemo(() => {
        console.log('********************************')
        return localAuth.createState()
    }, [appName, syncAddress, appHostName])

    /**
     * Get todo content
     */
    const list = useMemo(() => {
        if (!localNode.value) return
        console.log('________________in memo_________________')
        return telepathicSignal(localNode.value, listId)
    }, [listId])

    // useEffect(() => {
    //     if (!localNode.value) return
    //     telepathicSignal(localNode.value, listId)
    //         .then(state => {
    //             list = state
    //         })
    // }, [localNode.value])

    // @ts-ignore
    window.authStatus = authStatus

    // instantiate a local node & authenticate
    useEffect(() => {
        const done = localAuth(appName, appHostName, {
            authStatus,
            localNode,
            logoutCount,
            syncAddress
        })

        return done
    }, [appName, appHostName, syncAddress, logoutCount.value])

    console.log('render', authStatus.value, localNode.value)

    /**
     * Get the app state -- todo list
     */
    useEffect(() => {
        if (!localNode.value) return
        window.addEventListener('hashchange', listener)
        listener()

        async function listener () {
            console.log('hash change', localNode.value)
            if (!localNode.value) return
            const acceptedInvitation =
                await consumeInviteLinkFromWindowLocation(localNode.value)

            console.log('accepted invitation', acceptedInvitation)

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
        console.log('logout');
        (authStatus.value as SignedInStatus).logOut()
    }

    return (<div className={signedIn ? 'signed-in' : 'not-signed-in'}>
        <h1>{appName}</h1>

        {signedIn ?
            (<div>
                signed in, this is the app
                <TodoListEl list={list} />
                <div>
                    <button onClick={logout}>logout</button>
                </div>
            </div>) :
            (<Login authStatus={authStatus} />)
        }
    </div>)
}

function isSignedIn (
    authStatus:Signal<AuthStatus>,
    localNode:Signal<LocalNode|null>
):boolean {
    return (!!localNode.value && !!(authStatus.value as SignedInStatus).logOut)
}

function TodoListEl ({ list }:{ list?:Signal<TodoList|null> }):FunctionComponent|null {
    if (!list || !list.value) return null

    return (<div>
        list
    </div>)
}
