import { FunctionComponent } from 'preact'
import { LocalNode, CoID } from 'cojson'
import { useEffect, useState, useMemo, useCallback } from 'preact/hooks'
import { consumeInviteLinkFromWindowLocation } from 'jazz-browser'
import { Signal } from '@preact/signals'
import { Login } from './login.jsx'
import {
    telepathicSignal,
    localAuth,
    AuthStatus,
    SignedInStatus
} from '../src/index.js'
import { ListOfTasks, TodoProject } from './types.js'
import { TextInput } from './components/text-input.jsx'
import { Button } from './components/button.jsx'
import './components/text-input.css'
import './components/button.css'
import './todo-app.css'
import './list-controls.css'

export function TodoApp ({
    appName,
    syncAddress,
    appHostName
}:{
    appName:string,
    syncAddress?:string,
    appHostName?:string
}):FunctionComponent {
    const [listId, setListId] = useState<CoID<ListOfTasks>>()

    const { authStatus, localNode, logoutCount } = useMemo(() => {
        return localAuth.createState()
    }, [])

    const createList = useCallback((title: string) => {
        if (!title) return
        if (!localNode.value) return

        // To create a new todo project, we first create a `Group`,
        // which is a scope for defining access rights (reader/writer/admin)
        // of its members, which will apply to all CoValues owned by that group.
        const projectGroup = localNode.value.createGroup()

        // Then we create an empty todo project and list of tasks within
        //   that group.
        const project = projectGroup.createMap<TodoProject>()
        const tasks = projectGroup.createList<ListOfTasks>()

        // We edit the todo project to initialise it.
        // Inside the `.edit` callback we can mutate a CoValue
        project.edit((project) => {
            project.set('title', title)
            project.set('tasks', tasks.id)
        })

        // navigateToProjectId(project.id);
    }, [localNode.value])

    /**
     * Get todo content
     */
    const list = useMemo(() => {
        return telepathicSignal(localNode, listId)
    }, [localNode.value, listId])

    console.log('render', authStatus.value, localNode.value, logoutCount.value)

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

        if (!localNode.value) return done

        return done
    }, [appName, appHostName, syncAddress, logoutCount.value])

    /**
     * Get the app state -- a todo list
     */
    useEffect(() => {
        if (!localNode.value) return
        window.addEventListener('hashchange', listener)
        listener()

        async function listener () {
            if (!localNode.value) return
            const acceptedInvitation =
                await consumeInviteLinkFromWindowLocation(localNode.value)

            if (acceptedInvitation) {
                setListId(acceptedInvitation.valueID as CoID<ListOfTasks>)
                window.location.hash = acceptedInvitation.valueID
                return
            }

            setListId(window.location.hash.slice(1) as CoID<ListOfTasks>)
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
                <ListControls onCreateList={createList} />
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

function ListControls ({ onCreateList }:{
    onCreateList: (title:string) => void
}):FunctionComponent {
    const [isValid, setValid] = useState(false)

    function submit (ev) {
        ev.preventDefault()
        const { title } = ev.target.elements
        onCreateList(title.value)
    }

    // need this because `onInput` event doesnt work for cmd + delete event
    async function onFormKeydown (ev:KeyboardEvent) {
        const key = ev.key
        const { form } = ev.target as HTMLInputElement
        if (!form) return
        if (key !== 'Backspace' && key !== 'Delete') return

        const _isValid = (form.checkValidity())
        if (_isValid !== isValid) setValid(_isValid)
    }

    function handleInput (ev) {
        const { form } = ev.target as HTMLInputElement
        const _isValid = (form as HTMLFormElement).checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    return (<form className="list-controls" onSubmit={submit}
        onInput={handleInput}
        onKeydown={onFormKeydown}
    >
        <TextInput minLength={3} displayName="List name"
            name="title"
            required={true}
        />

        <div className="control">
            <Button isSpinning={false}
                disabled={!isValid}
            >
                Create a new todo list
            </Button>
        </div>
    </form>)
}

function TodoListEl ({ list }:{
    list:Signal<ListOfTasks|null>
}):FunctionComponent|null {
    console.log('list', list?.value)
    if (!list.value) return null

    return (<div className="todo-list">
        <ul className="todo-list">
            <li>list</li>
        </ul>
    </div>)
}
