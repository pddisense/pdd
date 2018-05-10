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
import { Link } from 'react-router-dom';

import CampaignTableContainer from './CampaignTableContainer';

class CampaignList extends React.Component {
  render() {
    return (
      <div>
        <div className="actions">
          <Link to="/campaigns/new"
                className="pt-button pt-icon-add pt-intent-primary">
            New campaign
          </Link>
        </div>

        <h2>Campaigns</h2>
        <CampaignTableContainer/>
      </div>
    );
  }
}

export default CampaignList;
