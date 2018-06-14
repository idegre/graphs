import React, {Component} from 'react';
import Graph from './graph';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

class App extends Component {
  render(){
  	return(
  	  <div>
  	  	<Toolbar>
  	  	<ToolbarTitle text="Graph App" />
  	  	</Toolbar>
  	  	<Graph />
  	  </div>
  	)
  }
}
export default App