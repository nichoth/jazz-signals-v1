import { FunctionComponent } from 'preact'
import { useMemo, useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { signal, Signal } from '@preact/signals'
import { Task } from '../types.js'
import { NewTaskInputRow } from '../components/new-task.jsx'
import { telepathicSignal } from '../../src/index.js'
import { Events } from '../state.js'
import { Divider } from '../components/divider.jsx'
import './main.css'
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
    const projectSignal = useMemo(() => {
        return telepathicSignal({
            id: params.id,
            localNode
        })
    }, [params.id, localNode])

    const [project] = projectSignal.value

    // get tasks
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
    console.log('project', project)

    return (<div>
        <h2>List</h2>
        <h3>{project?.get('title')}</h3>
        <ul className="todo-list">
            {tasks?.map((taskId: CoID<Task>) => {
                const [task] = useMemo(
                    () => telepathicSignal({ id: taskId, localNode }),
                    [taskId, localNode]).value

                console.log('task in map', task)
                console.log('task id,', taskId)

                return (<li key={taskId}>
                    <input type="checkbox" />
                    <span>{task?.get('text')}</span>
                </li>)
            })}
        </ul>

        <Divider />

        <div className="task-controls">
            <NewTaskInputRow onCreateTask={createTask}
                disabled={false}
            />
        </div>
    </div>)
}
