import { useContext } from 'react';
import DragContext from '@/contexts/DragContext';

export const useDragContext = () => useContext(DragContext);