import { FunctionComponent } from 'preact'
import { SubmittableInput } from './submittable-input.jsx'

export const NewTaskInputRow:FunctionComponent<{
    onCreateTask: (text: string) => void;
    disabled?: boolean;
}> = function NewTaskInputRow ({
    onCreateTask,
    disabled,
}) {
    return (<div>
        <SubmittableInput
            onSubmit={onCreateTask}
            displayName="New task name"
            disabled={disabled}
        />
    </div>)

    // return (
    //     <TableRow>
    //         <TableCell>
    //             <Checkbox className="mt-1" disabled />
    //         </TableCell>
    //         <TableCell>
    //             <SubmittableInput
    //                 onSubmit={(taskText) => createTask(taskText)}
    //                 label="Add"
    //                 placeholder="New task"
    //                 disabled={disabled}
    //             />
    //         </TableCell>
    //     </TableRow>
    // )
}
