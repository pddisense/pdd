import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import autobind from 'autobind-decorator';

const LINKS = [
  {
    title: 'Overview',
    action: 'view',
  },
  {
    title: 'Edit metadata',
    action: 'edit',
    what: 'metadata',
  },
  {
    title: 'Edit vocabulary',
    action: 'edit',
    what: 'vocabulary',
  },
  {
    title: 'Edit strategy',
    action: 'edit',
    what: 'strategy',
  },
];

@withRouter
class Tabs extends React.Component {
  @autobind
  handleClick(e, idx) {
    e.preventDefault();
    const link = LINKS[idx];
    let url = `/campaigns/${link.action}/${this.props.item.name}`;
    if (link.what) {
      url += `/${link.what}`;
    }
    if (this.props.location.pathname !== url) {
      this.props.history.push(url);
    }
  }

  render() {
    const path = this.props.location.pathname.split('/');
    const tabs = LINKS.map((link, idx) => {
      const active = path[2] === link.action && link.what === path[4];
      return (
        <li
          className="pt-tab"
          role="tab"
          key={idx}
          onClick={e => this.handleClick(e, idx)}
          aria-selected={active}>
          {link.title}
        </li>
      );
    });
    return (
      <div className="pt-tabs rythmed">
        <ul className="pt-tab-list" role="tablist">
          {tabs}
        </ul>
      </div>
    );
  }
}

Tabs.propTypes = {
  item: PropTypes.object,
};

export default Tabs;