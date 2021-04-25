import React from 'react';
import PropTypes from 'prop-types';
import css from './CollapsableCard.module.css';
import { Emoji } from '../../export';

export default class CollapsableCard extends React.Component {
  state = {
    expanded: false
  };

  expand = () => {
    this.setState(prevState => ({ expanded: !prevState.expanded }));
  };

  render() {
    const { id, question, answer, parentId } = this.props;

    return (
      <div className={`${css.cardItem} ${css.shadow}`}>
        <div
          className={`${css.cardHeader}`}
          id={`heading${id}`}
          data-toggle="collapse"
          data-target={`#collapse${id}`}
          aria-expanded="false"
          aria-controls={`collapse${id}`}
          onClick={this.expand}
        >
          <p className={`my-auto d-inline ${css.noSelect}`}>{question}</p>
          <span className="d-inline" style={{ float: 'right' }}>
            {this.state.expanded ? (
              <Emoji
                value="📖"
                ariaLabel="Open Book"
                style={{ fontSize: '1.2rem' }}
              />
            ) : (
              <Emoji
                value="📘"
                ariaLabel="Closed Book"
                style={{ fontSize: '1.2rem' }}
              />
            )}
          </span>
        </div>
        <div
          id={`collapse${id}`}
          className={`collapse ${css.cardBody}`}
          aria-labelledby={`heading${id}`}
          data-parent={`#${parentId}`}
        >
          <div className="card-body">{answer}</div>
        </div>
      </div>
    );
  }
}

CollapsableCard.propTypes = {
  id: PropTypes.number.isRequired,
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired
};
