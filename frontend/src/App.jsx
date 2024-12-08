/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import WeatherSearch from './components/WeatherSearch';
//import css file
import './index.css';

const App = () => {
  const [token, setToken] = useState(null);

  return (
    <div>
      {!token ? (
        <>
          <Login setToken={setToken} />
          <Signup setToken={setToken} />
        </>
      ) : (
        <WeatherSearch token={token} />
      )}
    </div>
  );
};

export default App;
