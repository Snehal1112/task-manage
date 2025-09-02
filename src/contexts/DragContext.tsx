import { createContext } from 'react';

interface DragContextType {
  activeId: string | null;
  overId: string | null;
}

const DragContext = createContext<DragContextType>({
  activeId: null,
  overId: null,
});

export default DragContext;