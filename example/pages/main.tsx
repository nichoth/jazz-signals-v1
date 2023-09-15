import { FunctionComponent } from 'preact'
// import { useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { useEffect } from 'preact/hooks'
import { Signal, useSignal } from '@preact/signals'
import { subscribe } from '../../src/index.js'
// import { Button } from '../components/button.jsx'
// import { TodoProject, ListOfTasks } from '../types.js'
// import { TextInput } from '../components/text-input.jsx'

export const MainView:FunctionComponent<{
    params:{ id:CoID<CoValueImpl> }
    localNode:Signal<LocalNode|null>
}> = function MainView ({
    localNode,
    params
}) {
    const projectSignal:Signal<CoValueImpl|null> = useSignal(null)
    const tasks:Signal<CoValueImpl|null> = useSignal(null)

    // the same localNode,
    // different IDs

    // get the project
    useEffect(() => {
        let done = () => {}

        // (async (done) => {
        //     done = await subscribe(params.id, localNode.value, (newState) => {
        //         projectSignal.value = newState
        //     })
        // })(_done)

        subscribe(params.id, localNode.value, (newState) => {
            console.log('subscribed', newState)
            projectSignal.value = newState
        }).then(_done => {
            done = _done
        })

        console.log('__done___', done)

        return done
    }, [params.id, localNode.value])

    // get the list of tasks
    useEffect(() => {
        if (!projectSignal.value) return
        let done = () => {}
        subscribe(projectSignal.value.get('tasks'), localNode.value, newState => {
            tasks.value = newState
        }).then(_done => {
            done = _done
        })

        projectSignal.value.get('tasks')
        console.log('tasks id')
        return done
    }, [projectSignal.value])

    console.log('project signal', projectSignal.value)
    console.log('tasks signal', tasks.value)

    return (<div>
        list view

        {/* <form onSubmit={submit}>
            <TextInput name="project-name" displayName="Project name" />
            <Button isSpinning={false} type="submit">
                Create a new project
            </Button>
        </form> */}
    </div>)
}
