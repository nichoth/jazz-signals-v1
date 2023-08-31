import { FunctionComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import {
    consumeInviteLinkFromWindowLocation,
    createBrowserNode
} from 'jazz-browser'
import { useSignal } from '@preact/signals'

// import {
//     LocalNode,
//     ContentType,
//     CoID,
//     ProfileContent,
//     CoMap,
//     AccountID,
//     Profile,
// } from 'cojson'
import { CoMap, CoID, LocalNode } from 'cojson'

type TaskContent = { done: boolean; text: string };
type Task = CoMap<TaskContent>;
type TodoListContent = {
    title: string;
    // other keys form a set of task IDs
    [taskId: CoID<Task>]: true;
}
type TodoList = CoMap<TodoListContent>

// export type AuthHook = () => {
//     auth: AuthProvider;
//     AuthUI:AnyComponent;
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

export const TodoApp:FunctionComponent<{
    syncAddress?:string,
    auth:PreactAuthHook,
}> = function App ({ syncAddress, auth: authHook }) {
    const [listId, setListId] = useState<CoID<TodoList>>()
    // local node is set in the example by the `WithJazz` context
    const localNode = useSignal<LocalNode|null>(null)

    const { auth, AuthUI, logOut } = authHook()

    useEffect(() => {
        let done: (() => void) | undefined

        (async () => {
            const nodeHandle = await createBrowserNode({
                auth,
                syncAddress,
            })

            setNode(nodeHandle.node)

            done = nodeHandle.done
        })().catch((e) => {
            console.log('Failed to create browser node', e)
        })

        return () => {
            done && done()
        }
    }, [auth, syncAddress])

    useEffect(() => {
        if (!localNode.value) return
        const listener = async () => {
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
        window.addEventListener('hashchange', listener)
        listener()

        return () => window.removeEventListener('hashchange', listener)
    }, [localNode.value])

    return (<div className="todo-list">
        {listId ? (
            <TodoListComponent listId={listId} />
        ) : (
            <SubmittableInput
                onSubmit={createList}
                label="Create New List"
                placeholder="New list title"
            />
        )}
        <Button
            onClick={() => {
                window.location.hash = ''
                logOut()
            }}
        >
            Log Out
        </Button>
    </div>)

    // return (<div>
    //     hello
    // </div>)
}

function TodoListComponent ({ listId }:{ listId: CoID<TodoList> }) {
    const list = useTelepathicState(listId)

    const createTask = (text: string) => {
        if (!list) return
        const task = list.coValue.getGroup().createMap<TaskContent>()

        task.edit((task) => {
            task.set('text', text)
            task.set('done', false)
        })

        list.edit((list) => {
            list.set(task.id, true)
        })
    }

    return (
        <div className="max-w-full w-4xl">
            <div className="flex justify-between items-center gap-4 mb-4">
                <h1>
                    {list?.get('title') ? (
                        <>
                            {list.get('title')}{' '}
                            <span className="text-sm">({list.id})</span>
                        </>
                    ) : (
                        <Skeleton className="mt-1 w-[200px] h-[1em] rounded-full" />
                    )}
                </h1>
                {list && <InviteButton list={list} />}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">Done</TableHead>
                        <TableHead>Task</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list &&
                        list
                            .keys()
                            .filter((key): key is CoID<Task> =>
                                key.startsWith('co_')
                            )
                            .map((taskId) => (
                                <TaskRow key={taskId} taskId={taskId} />
                            ))}
                    <TableRow key="new">
                        <TableCell>
                            <Checkbox className="mt-1" disabled />
                        </TableCell>
                        <TableCell>
                            <SubmittableInput
                                onSubmit={(taskText) => createTask(taskText)}
                                label="Add"
                                placeholder="New task"
                                disabled={!list}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
