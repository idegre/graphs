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
      /*graph:[
        {word:'wine',
          branch:[
            {word:'wine',branch:[
              {word:'wine',branch:[]},
              {word:'is',branch:[]},
              {word:'no',branch:[]},
              {word:'emulator',branch:[]},
            ]},
            {word:'is',branch:[]},
            {word:'no',branch:[]},
            {word:'emulator',branch:[]},
        ]}
      ],*/
      /*graph:[
        {word:'CF',
          branch:[
            {word:'CIA',branch:[
              {word:'central',branch:[]},
              {word:'inteligence',branch:[]},
              {word:'agency',branch:[]},
            ]},
            {word:'FBI',branch:[
              {word:'Federal',branch:[
                {word:'F.?.abbreviation',branch:[]},
              ]},
              {word:'bureau',branch:[]},
              {word:'investigation',branch:[]},
            ]},
        ]}
      ],*/
      graph:[],
  	}
  }
  componentWillMount(){
  	console.log('preMount');
  	this.getAbbreviationList();
  }

  //creates a list of words in the database
  getAbbreviationList(){
  	var words=[];//make an empty wird list
  	data.map(abb=>{
  	  words.push(abb.word)
  	});
  	console.log('got all the words!',words);
  	this.setState({wordList:words});
  }

  //returns a new graph with an extended branch
  addBranch(oldGraph,word){
    console.log('adding branch in',oldGraph,'for',word);
    var newGraph=[];
    if(oldGraph==null){//initialize graph
      newGraph.push({word:word});
      newGraph[0].branch=[];
    }
    if()
    for(var i=0;i<6;i++){
      newGraph.branch.push(); 
    }
    console.log('addBranch, newgr:',newGraph);
    return newGraph;
  }

  //adds the nesesary lines to the lines state
  makeLine(){

  }

  //returns the entire graph as jsx
  returnGraph(graph){
    const spacer=<div className="spacer"></div>
    var graphJSX=[];
    console.log('returnGraph, trying to print:',graph);
    var phrase=[];
    graph.map((leaf)=>{//this maps through the pharse
      console.log('returnGraph, mapping though branch:',leaf);
      phrase.push(<span>{leaf.word} </span>);
    })
    graphJSX.push(<div className="phraseContainer">{phrase}</div>);
    graphJSX.push(spacer);
    var level=[]
    for(var i=0;i<graph.length;i++){//this maps through diferent words looking for the ones that continue  downwards
      if(graph[i].branch.length>0){
        level.push(this.returnGraph(graph[i].branch));
      }
    }
    graphJSX.push(<div className="level">{level}</div>)
    return <div className="graph">{graphJSX}</div>;
  }

  /*
  *  it takes a json of a branch and returns the jsx objec for it
  */
  returnBranch(word){
    return <div>branch</div>
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
          <FloatingActionButton iconStyle={{height:30,width:30}} style={{height:30,width:30,marginRight:20}} onClick={()=>this.setState({graph:this.addBranch(null,this.state.currentSearch)})}>
            <ActionSearch />
          </FloatingActionButton>
        </div>
        {this.returnGraph(this.state.graph)}
  	  	<div>
          {/*נמוך
                    <span className="test">g</span><span className="test">r</span><span className="test">a</span><span className="test">p</span>*/}
        </div>
      
  	  </div>
  	)
  }
}
export default Graph;