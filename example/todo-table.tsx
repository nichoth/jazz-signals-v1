import { FunctionComponent, JSX } from 'preact'
import { CoID } from 'cojson'
import { TodoProject, Task } from './types.js'
import { telepathicSignal } from '../src/index.js'

import {
    Checkbox,
    SubmittableInput,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './components/index.js'

export function TodoTable ({ projectId }:{
    projectId: CoID<TodoProject>
}):FunctionComponent {
    const project = telepathicSignal(projectId)

    // `useTelepathicData()` reactively subscribes to updates to a CoValue's
    // content - whether we create edits locally, load persisted data, or receive
    // sync updates from other devices or participants!
    // const project = useTelepathicState(projectId)
    // const projectTasks = useTelepathicState(project?.get('tasks'))

    // `createTask` is similar to `createProject` we saw earlier, creating a new CoMap
    // for a new task (in the same group as the list of tasks/the project), and then
    // adding it as an item to the project's list of tasks.
    // const createTask = useCallback(
    //     (text: string) => {
    //         if (!projectTasks || !text) return
    //         const task = projectTasks.group.createMap<Task>()

    //         task.edit((task) => {
    //             task.set('text', text)
    //             task.set('done', false)
    //         })

    //         projectTasks.edit((projectTasks) => {
    //             projectTasks.push(task.id)
    //         })
    //     },
    //     [projectTasks]
    // )

    return (<div className="todo-table">
        table goes here
    </div>)

    // return (
    //     <div className="max-w-full w-4xl">
    //         <div className="flex justify-between items-center gap-4 mb-4">
    //             <h1>
    //                 {
    //                     // This is how we can access properties from the project,
    //                     // accounting for the fact that it might not be loaded yet
    //                     project?.get('title') ? (
    //                         <>
    //                             {project.get('title')}{' '}
    //                             <span className="text-sm">({project.id})</span>
    //                         </>
    //                     ) : (
    //                         <Skeleton className="mt-1 w-[200px] h-[1em] rounded-full" />
    //                     )
    //                 }
    //             </h1>
    //             <InviteButton list={project} />
    //         </div>
    //         <Table>
    //             <TableHeader>
    //                 <TableRow>
    //                     <TableHead className="w-[40px]">Done</TableHead>
    //                     <TableHead>Task</TableHead>
    //                 </TableRow>
    //             </TableHeader>
    //             <TableBody>
    //                 {
    //                     // Here, we iterate over the items of our `ListOfTasks`
    //                     // and render a `<TaskRow>` for each.

    //                     projectTasks?.map((taskId: CoID<Task>) => (
    //                         <TaskRow key={taskId} taskId={taskId} />
    //                     ))
    //                 }
    //                 <NewTaskInputRow
    //                     createTask={createTask}
    //                     disabled={!project}
    //                 />
    //             </TableBody>
    //         </Table>
    //     </div>
    // )
}

export function TaskRow ({ taskId }: { taskId: CoID<Task> }) {
    // `<TaskRow/>` uses `useTelepathicState()` as well, to granularly load and
    // subscribe to changes for that particular task.
    // const task = useTelepathicState(taskId)

    return (<div className="task-row">
        row goes here
    </div>)

    // return (
    //     <TableRow>
    //         <TableCell>
    //             <Checkbox
    //                 className="mt-1"
    //                 checked={task?.get('done')}
    //                 onCheckedChange={(checked) => {
    //                     // (the only thing we let the user change is the "done" status)
    //                     task?.edit((task) => {
    //                         task.set('done', !!checked)
    //                     })
    //                 }}
    //             />
    //         </TableCell>
    //         <TableCell>
    //             <div className="flex flex-row justify-between items-center gap-2">
    //                 <span className={task?.get('done') ? 'line-through' : ''}>
    //                     {task?.get('text') || (
    //                         <Skeleton className="mt-1 w-[200px] h-[1em] rounded-full" />
    //                     )}
    //                 </span>
    //                 {/* We also use a `<NameBadge/>` helper component to render the name
    //                     of the author of the task. We get the author by using the collaboration
    //                     feature `whoEdited(key)` on our `Task` CoMap, which returns the accountID
    //                     of the last account that changed a given key in the CoMap. */}
    //                 <NameBadge accountID={task?.whoEdited('text')} />
    //             </div>
    //         </TableCell>
    //     </TableRow>
    // )
}

function NewTaskInputRow ({ disabled }):FunctionComponent<JSX.HTMLAttributes> {
    return (<div>row goes here</div>)
}

// function NewTaskInputRow ({
//     createTask,
//     disabled,
// }: {
//     createTask: (text: string) => void;
//     disabled: boolean;
// }) {
//     return (
//         <TableRow>
//             <TableCell>
//                 <Checkbox className="mt-1" disabled />
//             </TableCell>
//             <TableCell>
//                 <SubmittableInput
//                     onSubmit={(taskText) => createTask(taskText)}
//                     label="Add"
//                     placeholder="New task"
//                     disabled={disabled}
//                 />
//             </TableCell>
//         </TableRow>
//     )
// }
