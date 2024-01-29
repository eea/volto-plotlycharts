import { useEffect, useState } from 'react';
import { withCookies } from 'react-cookie';

const JupyterCH = (props) => {
  const { cookies } = props;
  const [location] = useState(props.location);
  const [params] = useState(new URLSearchParams(location.search));
  const [auth_token] = useState(cookies.get('auth_token'));

  useEffect(() => {
    if (params.get('jupyter') !== 'y') return;
    window.parent.postMessage(
      {
        type: 'jupyter-ch:login',
        content: {
          auth: !auth_token,
          return_url: location.pathname,
        },
      },
      '*',
    );
  }, [location, auth_token, params]);

  return null;
};

export default withCookies(JupyterCH);
