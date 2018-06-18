import React, {Component} from 'react';
import $ from 'jquery';
import { findDOMNode } from 'react-dom';
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
      graph:[
        {word:'CF',
          level:0,
          branch:[
            {word:'CIA',level:1,branch:[
              {word:'Central',level:2,branch:[]},
              {word:'inteligence',level:2,branch:[]},
              {word:'agency',level:2,branch:[]},
            ]},
            {word:'FBI',level:1,branch:[
              {word:'Federal',level:2,branch:[
                {word:'F.?.abbreviation',level:3,branch:[]},
              ]},
              {word:'Bureau',level:2,branch:[]},
              {word:'Investigation',level:2,branch:[]},
            ]},
        ]}
      ],
      //graph:[],
  	}
  }
  componentWillMount(){
  	console.log('preMount');
  	this.getAbbreviationList();
  }

  //creates a list of words in the database
  getAbbreviationList(){
    console.log('getAbbreviationList, original data:',data);
  	var words=[];//make an empty wird list
  	data.map(abb=>{
  	  words.push(abb.word)
  	});
  	console.log('got all the words!',words);
  	this.setState({wordList:words});
  }

  //returns a new graph with an extended branch
  addBranch(oldGraph,word){
    console.log('addBranch,adding branch in',oldGraph,'for',word);
    var newGraph=[];
    if(oldGraph==null){//initialize graph in no graph edgecase
      newGraph.push({word:word});
      newGraph[0].branch=[];
      newGraph[0].level=0;
    }else{
      newGraph=oldGraph;//copies the old graph into a new one to add to it
    }

    //this is  the actual function
    const index=this.state.wordList.indexOf(word);
    for(var i=0;i<newGraph.length;i++){//this maps through diferent words looking for the ones that continue downwards
      if(newGraph[i].branch.length>0){
        console.log('addBranch, not on this level, going deper!');
        newGraph[i].branch=this.addBranch(newGraph[i].branch,word);//calls itself on the next layer

      }else if(newGraph[i].word==word&&index!=-1){//if the graph isn't already expanded and 
        console.log('addBranch, found it!',data[index]);
        for(var v=0;v<6;v++){//hardcoded because it's hardcoded in the json
          console.log('formGraph, hijos:');
          if(data[index][v]!=''){
            console.log('formGraph, adding:',data[index][v],'current:',newGraph[i].branch[v]);
            newGraph[i].branch[v]={};//make the json and the fill it
            newGraph[i].branch[v].level=newGraph[0].level+1;
            newGraph[i].branch[v].word=data[index][v];
            newGraph[i].branch[v].branch=[];//nessesary to keep it from crashing
          }
        }
      }
    }
    console.log('addBranch, newgr:',newGraph);
    return newGraph;
  }

  //returns the line pairs [..,{from:ref,to:ref},..]
  makeLines(graph){
    var linePairs=[];
    console.log('makeLines, looking for lines in', graph);
    for(var i=0;i<graph.length;i++){//this maps through diferent words looking for the ones that continue downwards
      console.log('makeLines, checking', graph[i]);
      if(graph[i].branch.length>0){//if it has sons...
        for(var l=0;l<graph[i].word.length;l++){
          var newLine={};
          const indexOfWord=graph[i].branch.findIndex((el)=>{return el.word[0].toLowerCase()==graph[i].word[l].toLowerCase()});
          console.log('makeLines, cheking letter by letter in:', graph[i].word[l],indexOfWord);
          if(indexOfWord>=0){
            newLine.from=graph[i].word+''+graph[i].word[l]+''+graph[i].level;
            newLine.to=graph[i].branch[indexOfWord].word+''+graph[i].branch[indexOfWord].word[0]+''+graph[i].branch[indexOfWord].level;
            console.log('makeLines, adding line from:',newLine.from,' to:',newLine.to);
            linePairs.push(newLine);
          }
        }
        linePairs=linePairs.concat(this.makeLines(graph[i].branch));
        console.log('makeLines, aded next level=>',linePairs);
      }
    }
    console.log('makeLines, returning',linePairs);
    return linePairs;
  }

  //takes the lines array and returns JSX
  drawLines(lines){
    var linesJSX=[];
    var key=0;
    lines.map(line=>{
      console.log('drawLines, adding:',line);
      linesJSX.push(<line
        key={key}
        x1={($(findDOMNode(this.refs[line.from])).position()!=undefined)?$(findDOMNode(this.refs[line.from])).position().left+5:null} 
        y1={($(findDOMNode(this.refs[line.from])).position()!=undefined)?$(findDOMNode(this.refs[line.from])).position().top+16:null}
        x2={($(findDOMNode(this.refs[line.to])).position()!=undefined)?$(findDOMNode(this.refs[line.to])).position().left+5:null}
        y2={($(findDOMNode(this.refs[line.to])).position()!=undefined)?$(findDOMNode(this.refs[line.to])).position().top-1:null}
        style={{stroke:'black',strokeWidth:2}} 
      />);
      key++;
    });
    return linesJSX;
  }

  //returns the entire graph as jsx
  returnGraph(graph,level){
    const spacer=<div className="spacer"></div>

    var graphJSX=[];
    console.log('returnGraph, trying to print:',graph);
    var phrase=[];
    graph.map((leaf)=>{//this maps through the pharse
      console.log('returnGraph, mapping though branch:',leaf);
      var word=[];
      var wordGroup=[];
      leaf.word.split("").map(letter=>{
        word.push(<span className="letter" ref={leaf.word+''+letter+''+level} id={leaf.word+''+letter+''+level}>{letter}</span>);
      });
      word.push(<span className="letter"></span>);
      wordGroup.push(<div>{word} </div>);//i add the word to the word group
      
      if((this.state.wordList.indexOf(leaf.word)!=-1)&&(leaf.branch.length==0)){//this word is on the database and not already expanded
        wordGroup.push(<div onClick={()=>this.setState({graph:this.addBranch(this.state.graph,leaf.word)})}>+</div>);//add an expand button
      }
      phrase.push(<span>{wordGroup} </span>);
    });

    graphJSX.push(<div className="phraseContainer">{phrase}</div>);
    graphJSX.push(spacer);

    var levelArray=[]
    for(var i=0;i<graph.length;i++){//this maps through diferent words looking for the ones that continue downwards
      if(graph[i].branch.length>0){
        levelArray.push(this.returnGraph(graph[i].branch,level+1));
      }
    }
    graphJSX.push(<div className="level">{levelArray}</div>)
    return <div className="graph">{graphJSX}</div>;
  }

  render(){
  	return(
  	  <div className="container" ref="container" style={{direction:(this.state.currentSearch.search(/[\u0040-\u007A]/)>=0)?"LTR":"RTL"}}>
        <svg className="svgContainer" height={$(findDOMNode(this.refs.container)).css("height")} width={$(findDOMNode(this.refs.container)).css("width")}>
          {this.drawLines(this.makeLines(this.state.graph))}
        </svg>
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
        {this.returnGraph(this.state.graph,0)}
        
        {console.log('position:',$(findDOMNode(this.refs.CIAC1)).position(),this.refs.CIAC1)}
  	  	<div>
          {/*נמוך
          <span className="test">g</span><span className="test">r</span><span className="test">a</span><span className="test">p</span>*/}
        </div>
      
  	  </div>
  	)
  }
}
export default Graph;