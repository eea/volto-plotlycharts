import { useEffect, useState } from 'react';
import { withCookies } from 'react-cookie';
import config from '@plone/volto/registry';

const Jupyter = (props) => {
  const { cookies } = props;
  const [location] = useState(props.location);
  const [auth_token] = useState(cookies.get('auth_token'));
  const [inIframe] = useState(__CLIENT__ && window.self !== window.top);

  useEffect(() => {
    if (!inIframe) return;
    window.parent.postMessage(
      {
        type: 'jupyter-ch:login',
        content: {
          auth: !!auth_token,
          location,
        },
      },
      config.settings.jupyterOrigin,
    );
  }, [location, auth_token, inIframe]);

  return null;
};

export default withCookies(Jupyter);
