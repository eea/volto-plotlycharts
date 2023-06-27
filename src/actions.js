import {
  GET_VISUALIZATION,
  REMOVE_VISUALIZATION,
  GET_ES_DATA,
} from './constants';

const demoQ = {
  query: {
    function_score: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: 'forest',
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
          filter: [
            {
              constant_score: {
                filter: {
                  bool: {
                    should: [
                      {
                        bool: {
                          must_not: {
                            exists: {
                              field: 'expires',
                            },
                          },
                        },
                      },
                      {
                        range: {
                          expires: {
                            gte: '2023-06-23T15:49:22Z',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              bool: {
                should: [
                  {
                    term: {
                      cluster_name: 'fise',
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
            {
              bool: {
                should: [
                  {
                    range: {
                      readingTime: {},
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
            {
              bool: {
                should: [
                  {
                    range: {
                      'issued.date': {
                        to: 1687524562988,
                        from: 1529844562988,
                      },
                    },
                  },
                ],
                minimum_should_match: 1,
                ignoreFromNlp: true,
              },
            },
            {
              bool: {
                should: [
                  {
                    term: {
                      language: 'en',
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
            {
              term: {
                hasWorkflowState: 'published',
              },
            },
            {
              constant_score: {
                filter: {
                  bool: {
                    should: [
                      {
                        bool: {
                          must_not: {
                            exists: {
                              field: 'issued',
                            },
                          },
                        },
                      },
                      {
                        range: {
                          'issued.date': {
                            lte: '2023-06-23T15:49:22Z',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      functions: [
        {
          exp: {
            'issued.date': {
              offset: '30d',
              scale: '1800d',
            },
          },
        },
      ],
      score_mode: 'sum',
    },
  },
  aggs: {},
  highlight: {
    fragment_size: 200,
    number_of_fragments: 3,
    fields: {
      'description.highlight': {
        highlight_query: {
          bool: {
            must: [
              {
                match: {
                  'description.highlight': {
                    query: 'forest',
                  },
                },
              },
            ],
            should: [
              {
                match_phrase: {
                  'description.highlight': {
                    query: 'forest',
                    slop: 1,
                    boost: 10,
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  size: 10,
  runtime_mappings: {
    op_cluster: {
      type: 'keyword',
      script: {
        source:
          'emit("_all_"); def clusters_settings = [["name": "News", "values": ["News","Article"]],["name": "Publications", "values": ["Report","Indicator","Briefing","Topic page","Country fact sheet"]],["name": "Maps and charts", "values": ["Figure (chart/map)","Chart (interactive)","Infographic","Dashboard","Map (interactive)"]],["name": "Data", "values": ["Data set"]],["name": "Others", "values": ["Webpage","Organisation","FAQ","Video","Contract opportunity","Glossary term","Collection","File","Adaptation option","Guidance","Research and knowledge project","Information portal","Tool","Case study","External data reference","Publication reference"]]]; def vals = doc[\'objectProvides\']; def clusters = [\'All\']; for (val in vals) { for (cs in clusters_settings) { if (cs.values.contains(val)) { emit(cs.name) } } }',
      },
    },
  },
  index: 'data_searchui',
  source: {
    exclude: ['embedding'],
  },
  track_total_hits: true,
  params: {
    DPRequestClassifier: {
      use_dp: false,
    },
    QADPRequestClassifier: {
      use_dp: false,
    },
    DensePassageRetriever: {
      top_k: 10,
    },
    RawRetriever: {
      top_k: 10,
    },
    AnswerExtraction: {
      top_k: 10,
    },
    AnswerOptimizer: {
      cutoff: 0.1,
    },
    QuerySearch: {},
  },
};

export function getVisualization(path, use_live_data) {
  return {
    type: GET_VISUALIZATION,
    path,
    use_live_data,
    request: {
      op: 'get',
      path: `${path}/@${
        use_live_data ? 'visualization-layout' : 'visualization'
      }`,
    },
  };
}

export function removeVisualization(path) {
  return {
    type: REMOVE_VISUALIZATION,
    path,
  };
}

export function getESData(path) {
  console.log('requesting es data', path);
  return {
    type: GET_ES_DATA,
    path,
    request: {
      op: 'post',
      path: `${path}`,
      data: demoQ,
    },
  };
}
