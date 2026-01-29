export const TodoEvents = {
  TODO_ITEM_COMPLETED: 'todo_item.completed',
};

export interface TodoItemCompletedEvent {
  id: string;
  title: string;
}
