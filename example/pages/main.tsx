import { FunctionComponent } from 'preact'
// import { useCallback } from 'preact/hooks'
import { LocalNode } from 'cojson'
import { useEffect } from 'preact/hooks';
// import { Button } from '../components/button.jsx'
// import { TodoProject, ListOfTasks } from '../types.js'
// import { TextInput } from '../components/text-input.jsx'

export function MainView ({
    localNode,
    params
}:{
    params:{ id:string };
    localNode: LocalNode;
}):FunctionComponent {
    // function submit (ev:SubmitEvent) {
    //     ev.preventDefault()
    //     createProject((ev.target as HTMLFormElement).elements['project-name'].value)
    // }
    console.log('got the id', params)

    useEffect(() => {
        // need to re-load the page if the project ID changes
    }, [params.id])

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
