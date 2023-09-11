import { FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { LocalNode } from 'cojson'
import { Button } from '../components/button.jsx'
import { TodoProject, ListOfTasks } from '../types.js'
import { TextInput } from '../components/text-input.jsx'

export function MainView ({
    params,
    localNode,
    navigateToProjectId
}:{
    params:{ id:string };
    localNode: LocalNode;
    navigateToProjectId:(id:string) => void;
}):FunctionComponent {
    const createProject = useCallback((title: string) => {
        if (!title) return

        // To create a new todo project, we first create a `Group`,
        // which is a scope for defining access rights (reader/writer/admin)
        // of its members, which will apply to all CoValues owned by that group.
        const projectGroup = localNode.createGroup()

        // Then we create an empty todo project and list of tasks within that group.
        const project = projectGroup.createMap<TodoProject>()
        const tasks = projectGroup.createList<ListOfTasks>()

        // We edit the todo project to initialise it.
        // Inside the `.edit` callback we can mutate a CoValue
        project.edit((project) => {
            project.set('title', title)
            project.set('tasks', tasks.id)
        })

        navigateToProjectId(project.id)
    }, [localNode, navigateToProjectId])

    function submit (ev:SubmitEvent) {
        ev.preventDefault()
        createProject((ev.target as HTMLFormElement).elements['project-name'].value)
    }

    return (<div>
        list view
        <form onSubmit={submit}>
            <TextInput name="project-name" displayName="Project name" />
            <Button isSpinning={false} type="submit">
                Create a new project
            </Button>
        </form>
    </div>)
}
