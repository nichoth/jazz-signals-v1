import { FunctionComponent } from 'preact'
// import { useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { useEffect } from 'preact/hooks'
import { Signal, useSignal } from '@preact/signals'
// import { telepathicSignal } from '../../src/index.js'
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
    const stateSignal:Signal<CoValueImpl|null> = useSignal(null)

    useEffect(() => {
        if (!localNode.value) return

        localNode.value.load(params.id).then(node => {
            const unsubscribe = node.subscribe(newState => {
                // queueMicrotask here because otherwise it throws
                // ReferenceError: Cannot access 'unsubscribe' before initialization
                console.log('---new state---', newState)
                window.queueMicrotask(() => {
                    console.log('Got update', params.id, newState.toJSON())
                    stateSignal.value = newState as CoValueImpl
                })
            })

            return unsubscribe
        })
    }, [params.id])

    console.log('state signal', stateSignal.value)

    // re-load only if the id changes
    // const telepathicState = useEffect(() => {
    //     const telepathicState = telepathicSignal({ id: params.id, localNode })
    //     return telepathicState
    // }, [params.id])

    // console.log('tele state', telepathicState.value)

    // if (!telepathicState.value) return null

    // const [project, done] = telepathicState.value

    // // project.then()

    // console.log('project getting', project?.get('tasks'))

    // useEffect(() => {
    //     // need to re-load the page if the project ID changes
    //     // telepathicState.value.
    // }, [params.id])

    // in the main app view, they check for a project ID,
    // and render the TodoTable if it exists

    // here we don't have to check for an ID
    // our router does that already,
    // any only shows this page if there is a project ID

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
