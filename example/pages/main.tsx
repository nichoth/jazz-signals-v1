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
import './main.css'
import { CopyBtn } from '../components/copy-btn.jsx'
const evs = Events.main

export const MainView:FunctionComponent<{
    params:{ id:CoID<CoValueImpl> }
    localNode:Signal<LocalNode|null>
    emit:(a:any, b:any)=>any
}> = function MainView ({
    localNode,
    params,
    emit
}) {
    // get project
    // subscribe to project changes
    // project is our name for a todo list
    const projectSignal = useMemo(() => {
        return telepathicSignal({
            id: params.id,
            localNode
        })
    }, [params.id, localNode])

    const [project] = projectSignal.value

    // get tasks
    // this is where we subscribe to task changes
    const tasksSignal = useMemo(() => {
        if (!project) return signal([])
        const projectId = project.get('tasks')

        return telepathicSignal({
            id: projectId,
            localNode
        })
    }, [project, localNode])

    const [tasks] = tasksSignal.value

    const createTask = useCallback(function createTask (name) {
        // @ts-ignore
        emit(evs.createTask, { name, tasks })
    }, [tasks])

    console.log('rendering...', tasks)

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
                const [task] = useMemo(
                    () => telepathicSignal({ id: taskId, localNode }),
                    [taskId, localNode]).value

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
            <InvitationLink list={project} /> :
            null
        }
    </div>)
}

const InvitationLink:FunctionComponent<{
    list: TodoProject
    onClick:(link:string) => void
}> = function InvitationLink ({ list, onClick }) {
    const [showToast, setToast] = useState<boolean>(false)
    const [invitation, setInvitation] = useState('')

    function create (ev) {
        ev.preventDefault()
        const inviteLink = createInviteLink(list, 'writer')
        setInvitation(inviteLink)
        setToast(true)
    }

    const closeToast = useCallback((ev) => {
        ev.preventDetault()
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
