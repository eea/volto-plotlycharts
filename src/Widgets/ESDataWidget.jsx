import React from 'react';
import { Client } from '@elastic/elasticsearch';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getESData } from '../actions';

// req made at http://localhost:3000/_es/globalsearch/_search

const ESDataWidgetBody = (props) => {
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    // // Initialize Elasticsearch client
    // const client = new Client({
    //   // TODO: use parameters here
    //   node: 'http://localhost:3000/_es/globalsearch/_search',
    // });
    // // Define the search query
    // const searchQuery = {
    //   index: 'your_index_name',
    //   body: {
    //     query: {
    //       match: { title: 'forest' }, // Searching for documents with 'example' in the 'title' field
    //     },
    //   },
    // };
    // // Perform the search query
    // const search = async () => {
    //   try {
    //     const { body } = await client.search(searchQuery);
    //     setResults(body.hits.hits);
    //   } catch (error) {
    //     console.error('Error occurred during the search:', error);
    //   }
    // };
    // // Call the search function
    // search();
    // // Clean up the Elasticsearch client on component unmount
    // return () => {
    //   client.close();
    // };
    getESData('./_es/globalsearch/_search');
  }, []);
  return <div>im mister databuilder widget</div>;
};

export default compose(
  connect(
    (state) => ({
      state,
    }),
    { getESData },
  ),
)(ESDataWidgetBody);
