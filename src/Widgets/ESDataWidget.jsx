import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';

// req made at http://localhost:3000/_es/globalsearch/_search

const createPayload = (query) => {
  return {
    query: {
      function_score: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  minimum_should_match: '75%',
                  fields: [
                    'title^2',
                    'subject^1.5',
                    'description^1.5',
                    'all_fields_for_freetext',
                  ],
                },
              },
            ],
          },
        },
        functions: [
          { exp: { 'issued.date': { offset: '30d', scale: '1800d' } } },
        ],
        score_mode: 'sum',
      },
    },
    aggs: {},
    size: 10,
    index: 'data_searchui',
    source: { exclude: ['embedding'] },
    track_total_hits: true,
  };
};

const ESDataWidgetBody = (props) => {
  const [results, setResults] = React.useState([]);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (query) {
      axios
        .post('./_es/globalsearch/_search', createPayload(query))
        .then((response) => {
          console.log('we haz responz', response.data.hits.hits);
          setResults(response.data.hits.hits);
        })
        .catch((error) => {
          console.log('error', error);

          console.error(error);
        });
    }
  }, [query]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div>
      <p>es databuilder widget</p>
      <input onChange={(e) => handleQueryChange(e)} />

      <h2>Results</h2>
      {results &&
        results.length > 0 &&
        results.map((item, index) => {
          return <div key={index}>_id : {item._id}</div>;
        })}
    </div>
  );
};

export default compose(
  connect(
    (state) => ({
      state,
    }),
    {},
  ),
)(ESDataWidgetBody);
