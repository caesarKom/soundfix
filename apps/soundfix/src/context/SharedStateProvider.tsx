import {createContext, ReactNode, useContext} from 'react';
import {SharedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import { BOTTOM_TAB_HEIGHT, screenHeight } from '../utils/constants';

interface SharedContextType {
  translationY: SharedValue<number>;
  collapsePlayer: () => void;
  expandPlayer: () => void;
}

const MIN_PLATER_HEIGHT = BOTTOM_TAB_HEIGHT + 60;
const MAX_PLATER_HEIGHT = screenHeight;

const SharedStateContext = createContext<SharedContextType | undefined>(undefined);

export const SharedStateProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const translationY = useSharedValue(0);
  const expandPlayer = () => {
    translationY.value = withTiming(-MAX_PLATER_HEIGHT + MIN_PLATER_HEIGHT, {
      duration: 300,
    });
  };
  const collapsePlayer = () => {
    translationY.value = withTiming(0, {duration: 300});
  };

  return (
    <SharedStateContext.Provider
      value={{translationY, expandPlayer, collapsePlayer}}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (context === undefined) {
    throw new Error('useSaredState must be used within a SharedStateProvider');
  }
  return context;
};