import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export async function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(name, params));
  }
}

export async function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

export async function resetAndNavigate(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: name, key: `${name}-${Date.now()}` }],
      }),
    );
  }
}

export async function prepareNavigation() {
  await navigationRef.isReady();
}