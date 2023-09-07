import { CoList, CoID, CoMap } from 'cojson'

/** An individual task which collaborators can tick or rename */
export type Task = CoMap<{ done: boolean; text: string; }>;

/** A collaborative, ordered list of task references */
export type ListOfTasks = CoList<CoID<Task>>;

/** Our top level object: a project with a title, referencing a list of tasks */
export type TodoProject = CoMap<{
    title: string;
    tasks: CoID<ListOfTasks>;
}>;
