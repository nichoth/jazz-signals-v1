import { FunctionComponent } from 'preact'
// import { useCallback } from 'preact/hooks'
import { LocalNode, CoID, CoValueImpl } from 'cojson'
import { useEffect, useMemo } from 'preact/hooks'
import { Signal } from '@preact/signals'
import { telepathicSignal } from '../../src/index.js'
// import { Button } from '../components/button.jsx'
// import { TodoProject, ListOfTasks } from '../types.js'
// import { TextInput } from '../components/text-input.jsx'

export function MainView ({
    localNode,
    params
}:{
    params:{ id:CoID<CoValueImpl> }
    localNode: Signal<LocalNode|null>
}):FunctionComponent {
    // function submit (ev:SubmitEvent) {
    //     ev.preventDefault()
    //     createProject((ev.target as HTMLFormElement).elements['project-name'].value)
    // }
    console.log('got the id', params)

    // need to wrap in `useMemo`
    // re-load only if the id changes
    const project = useMemo(() => {
        return telepathicSignal({ id: params.id, localNode })
    }, [params.id])

    console.log('tele state', project.value)

    console.log('project getting', project.value?.get('tasks'))

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
