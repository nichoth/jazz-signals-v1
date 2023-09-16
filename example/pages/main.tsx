import { FunctionComponent } from 'preact'
import { useEffect, useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { Signal, useSignal, effect } from '@preact/signals'
import { Task, ListOfTasks } from '../types.js'
import { NewTaskInputRow } from '../components/new-task.jsx'
import { subscribe } from '../../src/index.js'
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
    const projectSignal:Signal<CoValueImpl|null> = useSignal(null)
    const tasks:Signal<ListOfTasks|null> = useSignal(null)

    // get the project
    useEffect(() => {
        let done = () => {}

        subscribe(params.id, localNode.value, (newState) => {
            console.log('subscribed', newState)
            projectSignal.value = newState
        }).then(_done => {
            done = _done
        })

        return done
    }, [params.id, localNode.value])

    // get the tasks
    effect(() => {
        if (!projectSignal.value) return null
        let done = () => {}

        subscribe(projectSignal.value.get('tasks'), localNode.value, newState => {
            tasks.value = newState
        }).then(_done => {
            done = _done
        })

        return done
    })

    const createTask = useCallback(function createTask (name) {
        // @ts-ignore
        emit(evs.createTask, name)
    }, [])

    console.log('project signal', projectSignal.value)
    console.log('tasks signal', tasks.value)

    return (<div>
        list view

        <ul>
            {tasks.value?.map((taskId: CoID<Task>) => {
                // <TaskRow key={taskId} taskId={taskId} />
                return (<span key={taskId}>the id is: {taskId}</span>)
            }
            )}
        </ul>

        <div className="task-controls">
            <NewTaskInputRow onCreateTask={createTask} />
        </div>

        {/* <form onSubmit={submit}>
            <TextInput name="project-name" displayName="Project name" />
            <Button isSpinning={false} type="submit">
                Create a new project
            </Button>
        </form> */}
    </div>)
}
