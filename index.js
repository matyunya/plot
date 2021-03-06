import * as vega from 'vega';
import * as lite from 'vega-lite';
import { default as embed } from 'vega-embed';
export * from '/helpers.js';
export { default as select } from '~ellx-hub/lib/components/Select/index.js';

function config(data = [], mapping = []) {
  const values = data.map(([x, y]) => ({ x, y }));
  
  const withDefaults = {
    data: { values },
    mark: 'point',
    width: 400,
    height: 200,
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative',
      },
      y: {
        field: 'y',
        type: 'quantitative',
      }
    },
  };
  
  return mappingToArray(mapping).reduce((conf, fn) => {
    if (typeof fn === 'string') {
			return {
        ...conf,
        mark: fn,
      };
    }
    return fn(conf);
  }, withDefaults);
}

const useData = (i, first, layer) => layer.data.values.length > 0 && i !== 0
  ? layer.data
  : first.data;

function compose(first, ...layers) {
  return {
    width: first.width,
    height: first.height,
    layer: [
      first,
      ...layers,
    ].map((l, i) => ({
      data: useData(i, first, l),
      test: console.log(i, l.data || first.data),
      encoding: l.encoding,
      mark: l.mark,
    }))
  }
}

class Plot {
  constructor(props) {
    this.chart = document.createElement('div');
    this.update(props);
  }
  
  update({ data, mapping, layers = [] }) {
    const configs = [{ data, mapping }, ...layers]
    	.map(({ data, mapping }) => config(data, mapping));
    
  	const composed = compose(...configs);

    this.spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
      ...composed,
    };
    
    embed(this.chart, this.spec);
  }
  
  render(node) {
    node.appendChild(this.chart);
  }
}

const mappingToArray = m => m && Array.isArray(m)
  ? m
  : [m].filter(Boolean);

export const plot = props => ({
  ...props,
  __EllxMeta__: {
    component: Plot,
    operator: {
      binary: {
        '/': (l, r) => {
          l.mapping = [...mappingToArray(l.mapping), r];
          
          return l;
        },
        '+': (l, r) => {
        	l.layers = [...(l.layers || []), r];
          
          return l;
        },
      }
    }
  }
});

export const markOptions = [
  "area", "bar", "circle", "line", "point", "rect", "rule", "square", "text", "tick"
];
