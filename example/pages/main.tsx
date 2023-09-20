import { FunctionComponent } from 'preact'
import { useState, useMemo, useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { signal, Signal } from '@preact/signals'
import { createInviteLink } from 'jazz-browser'
import { Toast } from '../components/toast.jsx'
import { Task, TodoProject } from '../types.js'
import { Button } from '../components/button.jsx'
import { NewTaskInputRow } from '../components/new-task.jsx'
import { telepathicSignal } from '../../src/index.js'
import { Events } from '../state.js'
import { Divider } from '../components/divider.jsx'
import { CopyBtn } from '../components/copy-btn.jsx'
import './main.css'
const evs = Events.main

/**
 * This is the route for viewing a todo list.
 * The todo list ID comes from the URL -- /id/<projectId>
 */
export const MainView:FunctionComponent<{
    params:{ id:CoID<CoValueImpl> }
    localNode:Signal<LocalNode|null>
    emit:(a:any, b:any)=>any
}> = function MainView ({
    localNode,
    params,
    emit
}) {
    /**
     * create a new signal for the given project ID
     */
    const projectSignal = useMemo(() => {
        return telepathicSignal({
            id: params.id,  // <-- here we consume the project ID
            localNode
        })
    }, [params.id, localNode])

    const [project] = projectSignal.value

    // get tasks (the list of things to do)
    // this is where we subscribe to task changes
    const tasksSignal = useMemo(() => {
        if (!project) return signal([])
        // we depend on the 'tasks' key existing.
        // It is created by the subscription in ../state,
        // in the home.createList event handler
        const tasksId = project.get('tasks')

        return telepathicSignal({ id: tasksId, localNode })
    }, [project, localNode])

    const [tasks] = tasksSignal.value

    const createTask = useCallback(function createTask (name) {
        // @ts-ignore
        emit(evs.createTask, { name, tasks })
    }, [tasks])

    const handleChange = useCallback(function handleChange (task, ev) {
        // "done" status is all that can change
        const checked = ev.target.form.elements['done-status'].checked
        task.edit(_task => _task.set('done', !!checked))
    }, [])

    return (<div>
        <h2>List</h2>
        <h3>{project?.get('title')}</h3>
        <ul className="todo-list">
            {tasks?.map((taskId: CoID<Task>) => {
                /**
                 * create another state object (signal) for each task
                 *
                 * The `telepathicSignal` function subscribes a new signal
                 * to the given nodeId (taskId here)
                 */
                const [task] = useMemo(
                    () => telepathicSignal<Task>({ id: taskId, localNode }),
                    [taskId, localNode]
                ).value  // <-- we subscribe by accessing the .value property

                return (<li key={taskId}>
                    <form onChange={handleChange.bind(null, task)}>
                        <label>
                            <input type="checkbox" name="done-status" />
                            {task?.get('done') ?
                                (<s>{task.get('text')}</s>) :
                                (<span>{task?.get('text')}</span>)
                            }
                        </label>
                    </form>
                </li>)
            })}
        </ul>

        <Divider />

        <div className="task-controls">
            <NewTaskInputRow onCreateTask={createTask}
                disabled={false}
            />
        </div>

        {project ?
            <InvitationLinkControl list={project} /> :
            null
        }
    </div>)
}

const InvitationLinkControl:FunctionComponent<{
    list: TodoProject
}> = function InvitationLinkControl ({ list }) {
    const [showToast, setToast] = useState<boolean>(false)
    const [invitation, setInvitation] = useState('')

    console.log('project invitioatn', list)

    function create (ev) {
        ev.preventDefault()
        const inviteLink = createInviteLink(list, 'writer')
        setInvitation(inviteLink)
        setToast(true)
    }

    const closeToast = useCallback((ev:MouseEvent) => {
        ev.preventDefault()
        setToast(false)
    }, [])

    return list?.group.myRole() === 'admin' ?
        (<div className="create-invitation-link">
            <Button onClick={create} isSpinning={false}>Create invitation</Button>
            {showToast ?
                (<Toast type="success" onClose={closeToast}>
                    {invitation}
                    <CopyBtn payload={invitation}>Copy</CopyBtn>
                </Toast>) :
                null
            }
        </div>) :
        null
}
