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

import React from 'react';
import Raven from 'raven-js';
import { NonIdealState } from '@blueprintjs/core';

export default class RavenBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({error});
    Raven.captureException(error, {extra: errorInfo});
  }

  render() {
    if (this.state.error) {
      // Render fallback UI.
      return <NonIdealState
        title="Something went wrong."
        visual="error"
        description="We are very sorry about this. Our team has been notified and is investigating on this issue."
      />;
    } else {
      // when there is no error, render children untouched.
      return this.props.children;
    }
  }
}
