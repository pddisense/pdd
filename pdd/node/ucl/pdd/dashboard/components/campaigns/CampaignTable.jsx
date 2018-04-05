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
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import autobind from 'autobind-decorator';
import moment from 'moment';
import {identity} from 'lodash';

@withRouter
class CampaignTable extends React.Component {
  @autobind
  handleClick(campaign) {
    this.props.history.push(`/campaigns/view/${campaign.name}`);
  }

  render() {
    const rows = this.props.campaigns.map((item, idx) => {
      const wrap = (el) => item.startTime ? el : <span className="pt-text-muted">{el}</span>;
      return (
        <tr onClick={() => this.handleClick(item)} key={idx}>
          <td>{wrap(item.displayName ? item.displayName : 'Untitled campaign')}</td>
          <td>{wrap(item.email ? item.email : '-')}</td>
          <td>{wrap(item.startTime ? moment(item.startTime).fromNow() : '–')}</td>
          <td>{wrap(item.endTime ? moment(item.endTime).fromNow() : item.startTime ? 'never' : '-')}</td>
          <td>{wrap(item.collectEncrypted ? 'enabled' : 'disabled')}</td>
        </tr>
      );
    });
    return (
      <table className="pt-html-table pt-interactive pt-html-table-striped" style={{width: '100%'}}>
        <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th>Start time</th>
          <th>End time</th>
          <th>Encryption</th>
        </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

CampaignTable.propTypes = {
  campaigns: PropTypes.array,
};

CampaignTable.defaultProps = {
  campaigns: [],
};

export default CampaignTable;
