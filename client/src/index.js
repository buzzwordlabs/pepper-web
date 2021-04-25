import React from 'react';
import ReactDOM from 'react-dom';
// import { createBrowserHistory } from 'history';
import { GlobalContextProvider } from './global/GlobalContext';
import RenderRoutes from './routes/RenderRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './global/global.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactGA from 'react-ga';
import { hotjar } from 'react-hotjar';

toast.configure({ hideProgressBar: true });
if (process.env.NODE_ENV === 'production') {
}
// const hist = createBrowserHistory();
ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
ReactGA.pageview(window.location.pathname + window.location.search);
function App() {
  return (
    <GlobalContextProvider>
      <RenderRoutes />
    </GlobalContextProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
