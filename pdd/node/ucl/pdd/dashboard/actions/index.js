/*
 * Copyright 2017-2018 UCL / Vincent Primault <v.primault@ucl.ac.uk>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { map } from 'lodash';

import xhr from '../util/xhr';

const types = {};

export const FETCH_COLLECTION_START = 'FETCH_COLLECTION_START';
export const FETCH_COLLECTION_SUCCESS = 'FETCH_COLLECTION_SUCCESS';
export const FETCH_COLLECTION_ERROR = 'FETCH_COLLECTION_ERROR';

export const FETCH_NAMED_START = 'FETCH_NAMED_START';
export const FETCH_NAMED_SUCCESS = 'FETCH_NAMED_SUCCESS';
export const FETCH_NAMED_ERROR = 'FETCH_NAMED_ERROR';

export const UPDATE_START = 'UPDATE_START';
export const UPDATE_SUCCESS = 'UPDATE_SUCCESS';
export const UPDATE_ERROR = 'UPDATE_ERROR';

export const CREATE_START = 'CREATE_START';
export const CREATE_SUCCESS = 'CREATE_SUCCESS';
export const CREATE_ERROR = 'CREATE_ERROR';

export function getActionTypes(pluralName) {
  if (!(pluralName in types)) {
    const upperPluralName = pluralName.toUpperCase();
    const newTypes = {};

    newTypes[FETCH_COLLECTION_START] = `FETCH_${upperPluralName}_COLLECTION_START`;
    newTypes[FETCH_COLLECTION_SUCCESS] = `FETCH_${upperPluralName}_COLLECTION_SUCCESS`;
    newTypes[FETCH_COLLECTION_ERROR] = `FETCH_${upperPluralName}_COLLECTION_ERROR`;

    newTypes[FETCH_NAMED_START] = `FETCH_${upperPluralName}_NAMED_START`;
    newTypes[FETCH_NAMED_SUCCESS] = `FETCH_${upperPluralName}_NAMED_SUCCESS`;
    newTypes[FETCH_NAMED_ERROR] = `FETCH_${upperPluralName}_NAMED_ERROR`;

    newTypes[UPDATE_START] = `UPDATE_${upperPluralName}_START`;
    newTypes[UPDATE_SUCCESS] = `UPDATE_${upperPluralName}_SUCCESS`;
    newTypes[UPDATE_ERROR] = `UPDATE_${upperPluralName}_ERROR`;

    newTypes[CREATE_START] = `CREATE_${upperPluralName}_START`;
    newTypes[CREATE_SUCCESS] = `CREATE_${upperPluralName}_SUCCESS`;
    newTypes[CREATE_ERROR] = `CREATE_${upperPluralName}_ERROR`;

    types[pluralName] = newTypes;
  }
  return types[pluralName];
}

function buildAction(pluralName, type, payload = {}) {
  return {
    type: getActionTypes(pluralName)[type],
    ...payload,
  }
}


export function createAction(item, pluralName) {
  return (dispatch) => {
    dispatch(buildAction(pluralName, CREATE_START, { item }));
    return xhr(
      `/api/${pluralName}`,
      { method: 'POST', body: JSON.stringify(item) }
    ).then(
      json => dispatch(buildAction(pluralName, CREATE_SUCCESS, { item: json })),
      error => dispatch(buildAction(pluralName, CREATE_ERROR, { name: item.name, error }))
    );
  }
}

export function updateAction(item, pluralName) {
  return (dispatch) => {
    dispatch(buildAction(pluralName, UPDATE_START, { item }));
    return xhr(
      `/api/${pluralName}/${item.name}`,
      { method: 'PUT', body: JSON.stringify(item) }
    ).then(
      json => dispatch(buildAction(pluralName, UPDATE_SUCCESS, { item: json })),
      error => dispatch(buildAction(pluralName, UPDATE_ERROR, { name: item.name, error }))
    );
  }
}

export function fetchNamedAction(name, pluralName) {
  return (dispatch) => {
    dispatch(buildAction(pluralName, FETCH_NAMED_START, { name }));
    return xhr(`/api/${pluralName}/${name}`)
      .then(
        item => dispatch(buildAction(pluralName, FETCH_NAMED_SUCCESS, { item })),
        error => dispatch(buildAction(pluralName, FETCH_NAMED_ERROR, { name, error }))
      );
  }
}

export function fetchCollectionAction(pluralName, params = {}) {
  let url = `/api/${pluralName}`;
  if (Object.keys(params).length > 0) {
    url += '?' + map(params, (v, k) => `${k}=${encodeURIComponent(v)}`).join('&');
  }
  return (dispatch) => {
    dispatch(buildAction(pluralName, FETCH_COLLECTION_START, { ...params }));
    return xhr(url)
      .then(
        results => dispatch(buildAction(pluralName, FETCH_COLLECTION_SUCCESS, { ...results })),
        error => dispatch(buildAction(pluralName, FETCH_COLLECTION_ERROR, { error }))
      );
  }
}