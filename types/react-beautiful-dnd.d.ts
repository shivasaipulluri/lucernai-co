declare module "react-beautiful-dnd" {
    // These are simplified types just to make TypeScript happy
    // In a real project, you'd want to use the proper types from @types/react-beautiful-dnd
  
    export interface DraggableProvided {
      draggableProps: any
      dragHandleProps: any
      innerRef: (element: HTMLElement | null) => void
    }
  
    export interface DroppableProvided {
      droppableProps: any
      innerRef: (element: HTMLElement | null) => void
      placeholder: React.ReactNode
    }
  
    export interface DragDropContextProps {
      onDragEnd: (result: any) => void
      children: React.ReactNode
    }
  
    export interface DroppableProps {
      droppableId: string
      children: (provided: DroppableProvided) => React.ReactNode
    }
  
    export interface DraggableProps {
      draggableId: string
      index: number
      children: (provided: DraggableProvided) => React.ReactNode
    }
  
    export const DragDropContext: React.FC<DragDropContextProps>
    export const Droppable: React.FC<DroppableProps>
    export const Draggable: React.FC<DraggableProps>
  }
  