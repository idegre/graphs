import React, {Component} from 'react';
import "../graph.css";
import * as data from"../data.json";
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import {ActionSearch, AddCircle} from 'material-ui/svg-icons';

/*const Button = (props) => {
  return (
    <
  );
};*/

class Graph extends Component {
  constructor(props){
  	super(props);
  	this.state={
  	  wordList:[],
      currentSearch:"",
      graphTree:{}
  	}
  }
  componentWillMount(){
  	console.log('preMount');
  	this.getAbbreviationList();
  }

  getAbbreviationList(){
  	var words=[];//make an empty wird list
  	data.map(abb=>{
  	  words.push(abb.word)
  	});
  	console.log('got all the words!',words);
  	this.setState({wordList:words});
  }

  formGraph(root){
    const spacer=<div className="spacer"></div>
    var graph=[];
    graph.push(<div className="graphText">{this.state.currentSearch}</div>);
    graph.push(spacer);
    const rootIndex=this.state.wordList.indexOf(this.state.currentSearch)
    if(rootIndex!=-1){
      console.log('formGraph, tiene hijos');
      var phrase=[];
      for(var i=0;i<6;i++){//hardcoded because it's hardcoded in the json
        console.log('formGraph, hijos:',data[rootIndex][i]);
        if(data[rootIndex][i]!=''){
          if(this.state.wordList.indexOf(data[rootIndex][i])){
            console.log('formGraph,',data[rootIndex][i],' tiene sub hijos!');
            phrase.push(
              <div className="phrase">
                <span>{data[rootIndex][i]} </span>
                <div onClick={}>+</div>
              </div>
            );
          }else{
            phrase.push(
              <span>{data[rootIndex][i]} </span>
            );
          }
        }
      }
      graph.push(<div className="graphText">{phrase}</div>);//i add the whole phare in a div to keep it together
    }
    return graph;
  }

  render(){
  	return(
  	  <div className="container" style={{direction:(this.state.currentSearch.search(/[\u0040-\u007A]/)>=0)?"LTR":"RTL"}}>
        
        <div>
    	  	<AutoComplete
            className="inputBox"
            hintText="וֹטָרִיקוֹן"
            dir={(this.state.currentSearch.search(/[\u0040-\u007A]/)>=0)?"LTR":"RTL"}
            dataSource={this.state.wordList}
            onUpdateInput={(searchText)=>this.setState({currentSearch:searchText})}
          />
          <FloatingActionButton onClick={()=>this.setState({graph:this.formGraph()})}>
            <ActionSearch className="searchButton" />
          </FloatingActionButton>
        </div>
        <svg className="svgOverlay" height="1000" width="1000">
           <circle cx={500} cy={200} r={10} fill="red" />
        </svg>
        {this.state.graph}
  	  	<div>
          נמוך
          <span className="test">g</span><span className="test">r</span><span className="test">a</span><span className="test">p</span>
        </div>
      
  	  </div>
  	)
  }
}
export default Graph;