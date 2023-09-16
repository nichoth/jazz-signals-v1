import { FunctionComponent } from 'preact'
import { useMemo, useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { signal, Signal } from '@preact/signals'
import { Task } from '../types.js'
import { NewTaskInputRow } from '../components/new-task.jsx'
import { telepathicSignal } from '../../src/index.js'
import { Events } from '../state.js'
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

    return (<div>
        list view

        <ul>
            {tasks?.map((taskId: CoID<Task>) => {
                console.log('task id,', taskId)
                return (<li key={taskId}>the id is: {taskId}</li>)
            })}
        </ul>

        <div className="task-controls">
            <NewTaskInputRow onCreateTask={createTask} />
        </div>
    </div>)
}
