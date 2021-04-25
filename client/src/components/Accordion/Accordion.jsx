import React from 'react';
// import css from './Accordion.module.css';
import CollapsableCard from './CollapsableCard/CollapsableCard';

export default function Accordion(props) {
  return (
    <div className="" id={props.id}>
      {props.data.map((card, key) => {
        return (
          <CollapsableCard
            question={card.question}
            answer={card.answer}
            parentId={props.id}
            id={key}
            key={key}
          />
        );
      })}
    </div>
  );
}
