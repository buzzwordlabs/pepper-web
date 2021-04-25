import React from 'react';

export default function Greeting(props) {
  return (
    <div className="text-center">
      <h1 className="m-3">Hey there! You must be new.</h1>
      <h4 className="m-5">Let's get you started.</h4>
      <button className="btn btn-primary" onClick={props.goForward}>
        Continue
      </button>
    </div>
  );
}
