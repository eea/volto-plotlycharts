import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import {
  Enlarge,
  FigureNote,
  Sources,
  MoreInfo,
  Share,
} from '@eeacms/volto-embed/Toolbar';
import Download from './Download';

const Toolbar = (props) => {
  const el = useRef();
  const [mobile, setMobile] = useState(false);
  const { screen, enlargeContent, chartData } = props;
  const {
    with_sources = true,
    with_notes = true,
    with_more_info = true,
    with_enlarge = true,
    with_share = true,
    download_button = true,
  } = props.data || {};

  const { data_provenance, figure_note } = props.data?.properties || {};

  const visualization_id =
    props.data?.properties?.['@id'] || props.data?.vis_url;

  useEffect(() => {
    if (!el.current) {
      return;
    }
    const width = el.current.parentElement.offsetWidth;

    if (width < 600 && !mobile) {
      setMobile(true);
    } else if (width >= 600 && mobile) {
      setMobile(false);
    }
  }, [screen, mobile]);

  return (
    <div ref={el} className={cx('visualization-toolbar', { mobile })}>
      <div className="left-col">
        {with_notes && <FigureNote notes={figure_note || []} />}
        {with_sources && (
          <Sources
            sources={data_provenance?.data || props.data?.chartSources}
          />
        )}
        {with_more_info && <MoreInfo href={visualization_id} />}
      </div>
      <div className="right-col">
        {download_button && <Download {...props} chartData={chartData} />}
        {with_share && <Share href={visualization_id} />}
        {with_enlarge && <Enlarge>{enlargeContent}</Enlarge>}
      </div>
    </div>
  );
};

export default connect((state) => ({
  screen: state.screen,
}))(Toolbar);
