import * as utilsImport from './utils';
import * as actionsImport from './utils/store/actions';
import * as appActionImport from './utils/store/appAction';
import * as routeActionImport from './utils/store/routeAction';

import coreConfigs from './configs/core';
import appReducer from './store/appReducer';
import { createStore } from './utils/ruuiStore';

export { RuuiContext } from './utils/context';
export { ruuiMiddleware, ruuiReducer } from './store';
export { connect } from './utils/ruuiStore';

export function createRuuiStore() {
	return createStore(appReducer);
}

export * from './components';
export * from './decorators';
export * from './utils/store/appReducer';
export * from './utils/store/routeReducer';
export * from './utils/collection';

export const utils = utilsImport;
export const actions = actionsImport;
export const appAction = appActionImport;
export const ruuiActions = appActionImport;
export const routeActions = routeActionImport;
export const routeAction = routeActionImport;
export const defaultConfigs = coreConfigs;
