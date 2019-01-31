import React, { Component } from 'react';
import { Kpi, ColumnChart, Execute, Visualization } from './components/afmConnected';
import { Model } from '@gooddata/react-components';
import { AfmActions } from '@gooddata/gdc-afm-connect';
import { connect } from 'react-redux';
import C from './catalog';
import config from './config';
import { FG_MAIN } from './constants';
import AttributeDropdown from './components/AttributeDropdown';
import CustomBarChart from './components/CustomBarChart';

import '@gooddata/react-components/styles/css/main.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.handleIncomingCityFilterChange = this.handleIncomingCityFilterChange.bind(this);
    this.handleTestButtonClick = this.handleTestButtonClick.bind(this);
  }

  componentDidMount() {
    window.addEventListener('message', this.handleIncomingCityFilterChange);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleIncomingCityFilterChange);
  }

  handleIncomingCityFilterChange(message) {
      // catching postMessages when embedded into pixel-perfect dashboard
      console.log("handleIncomingCityFilterChange");
      let data;

      console.log(message);

      if (message.data) {
        try {
          data = JSON.parse(message.data);
        } catch(e) {
          data = message.data;
        }
      }

      if (data && data.gdc && data.gdc.name === 'filter.value.changed') {
        const values = data.gdc.data;

        console.log(values);

        if (values.length && values[0].label === C.attributeDisplayForm('Location City')) {
          this.props.cityFilterChanged(values)
        }
      }
  }

  handleTestButtonClick() {
    console.log("handleTestButtonClick")
    const message = {
      "gdc":{
         "setFilterContext":[
            {
               "label":"label.restaurantlocation.locationcity",
               "type":"attribute",
               "value":"Dallas"
            }
         ]
      }
   };

    window.parent.postMessage(JSON.stringify(
      message,
      ), '*');
  }

  render() {
    return (
      <div className="App">
        <div style={{ width: 400, margin: 'auto', marginBottom: 20, marginTop: 20 }}>
        <button onClick={this.handleTestButtonClick}>Test</button>
        </div>
        <div>
          # of Location City: <Kpi
            {...config}
            filterGroup={FG_MAIN}
            measure={C.measure('# Location City')}
          />
          <br />
          <br />
        </div>
        <div style={{ height: 400 }}>
          <Visualization
            {...config}
            filterGroup={FG_MAIN}
            identifier="aby6oS6DbpFX"
          />
        </div>
        <div style={{ height: 400 }}>
          <ColumnChart
            {...config}
            filterGroup={FG_MAIN}
            measures={[Model.measure(C.measure('# Checks'))]}
            viewBy={Model.attribute(C.attributeDisplayForm('Location City'))}
            stackBy={Model.attribute(C.attributeDisplayForm('Location Name'))}
          />
        </div>
        <div style={{ height: 400 }}>
          <Execute
            {...config}
            filterGroup={FG_MAIN}
            afm={{
              measures: [{
                localIdentifier: 'm1',
                definition: {
                  measure: {
                    item: {
                      identifier: C.measure('# Checks')
                    }
                  }
                }
              }],
              attributes: [{
                localIdentifier: 'a1',
                displayForm: {
                  identifier: C.attributeDisplayForm('Location City')
                }
              }]
            }}
            children={CustomBarChart}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  cityFilterChanged: (values) => dispatch(AfmActions.updatePositiveAttributeFilter(
    FG_MAIN,
    C.attributeDisplayForm('Location City'),
    values.map(value => value.elementUri)
  ))
});

export default connect(null, mapDispatchToProps)(App);
