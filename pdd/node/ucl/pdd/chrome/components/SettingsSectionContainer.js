/*
 * PDD is a platform for privacy-preserving Web searches collection.
 * Copyright (C) 2016-2018 Vincent Primault <v.primault@ucl.ac.uk>
 *
 * PDD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PDD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with PDD.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import autobind from 'autobind-decorator';
import { Intent } from '@blueprintjs/core';

import { getData, setData } from '../browser/storage';
import SettingsSection from './SettingsSection';
import xhr from '../util/xhr';
import toaster from './toaster';

export default class SettingsSectionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
    };
  }

  @autobind
  handleChange(client) {
    let p;
    if (this.state.data.name) {
      p = xhr(
        `/api/clients/${this.state.data.name}`,
        { method: 'PATCH', body: JSON.stringify(client) }
      ).then(
        () => {
          toaster.show({ message: 'The settings have been updated.', intent: Intent.SUCCESS });
          return Promise.resolve();
        },
        (reason) => {
          toaster.show({ message: 'There was an error while updating the settings.', intent: Intent.DANGER });
          return Promise.reject(reason);
        }
      );
    } else {
      // It means that the client is not (yet) registered against the server.
      p = Promise.resolve();
    }
    p.then(
      () => setData({ ...this.state.data, ...client }),
      () => console.log('Cannot contact the server, changes are discarded.'),
    );
  }

  componentDidMount() {
    getData().then(data => this.setState({ data }));
  }

  render() {
    return <SettingsSection client={this.state.data} onChange={this.handleChange}/>;
  }
}
