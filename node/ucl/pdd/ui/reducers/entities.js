import { combineReducers } from 'redux';

import {
  getActionTypes,
  FETCH_COLLECTION_START,
  FETCH_COLLECTION_SUCCESS,
  FETCH_COLLECTION_ERROR,
  FETCH_NAMED_START,
  FETCH_NAMED_SUCCESS,
  FETCH_NAMED_ERROR,
  UPDATE_START,
  UPDATE_SUCCESS,
  UPDATE_ERROR,
  CREATE_START,
  CREATE_SUCCESS,
  CREATE_ERROR,
} from '../actions';

const initialStatus = {
  isLoading: false,
  isLoaded: false,
  lastError: null,
};

const initialState = {
  ...initialStatus,
  entities: {},
  fetchStatus: {},
  mutateStatus: {},
};

function createReducer(name) {
  const types = getActionTypes(name);
  return function reducer(state = initialState, action) {
    if (action.type === types[FETCH_COLLECTION_START]) {
      return setStatusLoading(state);
    }
    if (action.type === types[FETCH_COLLECTION_SUCCESS]) {
      return setEntityLoaded(setStatusLoaded(state), action.items, 'fetch');
    }
    if (action.type === types[FETCH_COLLECTION_ERROR]) {
      return setStatusError(state);
    }
    if (action.type === types[FETCH_NAMED_START]) {
      // When fetching a named entity, we also reset its mutating state. It is required for
      // interfaces, otherwise we could only edit an object once per page load.
      return setEntityLoading(resetEntity(state, action.name, 'mutate'), action.name, 'fetch');
    }
    if (action.type === types[FETCH_NAMED_SUCCESS]) {
      return setEntityLoaded(state, action.item, 'fetch');
    }
    if (action.type === types[FETCH_NAMED_ERROR]) {
      return setEntityError(state, action.name, action.error, 'fetch');
    }
    if (action.type === types[CREATE_START] || action.type === types[UPDATE_START]) {
      return setEntityLoading(state, action.item.metadata.name, 'mutate');
    }
    if (action.type === types[CREATE_SUCCESS] || action.type === types[UPDATE_SUCCESS]) {
      return setEntityLoaded(state, action.item, 'mutate');
    }
    if (action.type === types[CREATE_ERROR] || action.type === types[UPDATE_ERROR]) {
      return setEntityError(state, action.name, action.error, 'mutate');
    }
    return state;
  }
}

function resetEntity(state, names, type) {
  const key = `${type}Status`;
  const status = {...state[key]};
  if (!Array.isArray(names)) {
    names = [names];
  }
  names.forEach(name => status[name] = initialStatus);
  return {...state, [key]: status};
}

function setEntityLoading(state, names, type) {
  const key = `${type}Status`;
  const status = {...state[key]};
  if (!Array.isArray(names)) {
    names = [names];
  }
  names.forEach(name => status[name] = setStatusLoading(status[name] || initialStatus));
  return {...state, [key]: status};
}

function setEntityLoaded(state, items, type) {
  const key = `${type}Status`;
  const status = {...state[key]};
  const entities = {...state.entities};

  if (!Array.isArray(items)) {
    items = [items];
  }
  items.forEach(item => {
    status[item.metadata.name] = setStatusLoaded(status[item.metadata.name] || initialStatus);
    entities[item.metadata.name] = item;
  });

  return {...state, entities, [key]: status};
}

function setEntityError(state, names, error, type) {
  const key = `${type}Status`;
  const status = {...state[key]};
  if (!Array.isArray(names)) {
    names = [names];
  }
  names.forEach(name => status[name] = setStatusError(status[name] || initialStatus, error));
  return {...state, [key]: status};
}

function setStatusError(status, lastError) {
  return {...status, isLoading: false, lastError};
}

function setStatusLoaded(status) {
  return {...status, isLoading: false, isLoaded: true, lastError: null};
}

function setStatusLoading(status) {
  return {...status, isLoading: true};
}

export default combineReducers({
  namespaces: createReducer('namespaces'),
  campaigns: createReducer('campaigns'),
  clients: createReducer('clients'),
});
