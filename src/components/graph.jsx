import React, {Component} from 'react';
import $ from 'jquery';
import { findDOMNode } from 'react-dom';
import "../graph.css";
import AutoComplete from 'material-ui/AutoComplete';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import {ActionSearch} from 'material-ui/svg-icons';

class Graph extends Component {
  constructor(props){
  	super(props);
  	this.state={
      data:[],
  	  wordList:[],
      currentSearch:"",
      graph:[],
  	}
  }
  componentWillMount(){
  	console.log('preMount');
    $.getJSON('https://firebasestorage.googleapis.com/v0/b/abbreviationgraph.appspot.com/o/data.json?alt=media&token=032312ab-cd29-4020-b887-be51f6caa9ef',(dt)=>{
      console.log('fetch, dt=',dt);
      this.setState({data:dt});
      this.setState({wordList:this.getAbbreviationList(dt)});
    })
  	
    $( findDOMNode(this.refs['lvl0']) ).change(function() {
      this.forceUpdate();
    });
  }

  //creates a list of words in the database
  getAbbreviationList(data){
    console.log('getAbbreviationList, original data:',data);
  	var words=[];//make an empty wird list
  	data.map(abb=>{
  	  words.push(abb.word)
  	});
  	console.log('got all the words!',words);
  	return words
  }

  //returns a new graph with an extended branch
  addBranch(oldGraph,word,data){
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
        newGraph[i].branch=this.addBranch(newGraph[i].branch,word,this.state.data);//calls itself on the next layer

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
      var usedWords=[];//repository of already connected words
      if(graph[i].branch.length>0){//if it has sons...
        for(var l=0;l<graph[i].word.length;l++){
          var newLine={};
          const indexOfWord=graph[i].branch.findIndex((el)=>{return el.word[0].toLowerCase()==graph[i].word[l].toLowerCase()});//el is a branch
          const indexOfWord2=graph[i].branch.findIndex((el)=>{return el.word[1].toLowerCase()==graph[i].word[l].toLowerCase()});//check if second letter belongs
          console.log('makeLines, cheking letter by letter in:', graph[i].word[l],indexOfWord,indexOfWord2,usedWords);
        
          if(indexOfWord>=0||indexOfWord2>=0){//last condition chechs 
            newLine.from=graph[i].word+''+graph[i].word[l]+''+graph[i].level+'i'+l;
            if(indexOfWord2>=0&&indexOfWord==-1){
              newLine.to=graph[i].branch[indexOfWord2].word+''+graph[i].branch[indexOfWord2].word[1]+''+graph[i].branch[indexOfWord2].level+'i1';
              if(!usedWords.includes(graph[i].branch[indexOfWord2].word)){
                linePairs.push(newLine);
                usedWords.push(graph[i].branch[indexOfWord2].word);//add word to the repository
              }

            }else{
              newLine.to=graph[i].branch[indexOfWord].word+''+graph[i].branch[indexOfWord].word[0]+''+graph[i].branch[indexOfWord].level+'i0';
              if(!usedWords.includes(graph[i].branch[indexOfWord].word)){
                linePairs.push(newLine);
                usedWords.push(graph[i].branch[indexOfWord].word);//add word to the repository
              }
            }
            console.log('makeLines, adding line from:',newLine.from,' to:',newLine.to);
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
      if($(findDOMNode(this.refs[line.from])).position()==undefined||$(findDOMNode(this.refs[line.to])).position()==undefined){
        this.forceUpdate();
      }
      linesJSX.push(<line
        key={key}
        x1={($(findDOMNode(this.refs[line.from])).position()!=undefined)?$(findDOMNode(this.refs[line.from])).position().left+5:null} 
        y1={($(findDOMNode(this.refs[line.from])).position()!=undefined)?$(findDOMNode(this.refs[line.from])).position().top+16:null}
        x2={($(findDOMNode(this.refs[line.to])).position()!=undefined)?$(findDOMNode(this.refs[line.to])).position().left+5:null}
        y2={($(findDOMNode(this.refs[line.to])).position()!=undefined)?$(findDOMNode(this.refs[line.to])).position().top:null}
        style={{stroke:'DarkGray',strokeWidth:1}} 
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
      leaf.word.split("").map((letter,index)=>{

          word.push(<span className="letter" ref={leaf.word+''+letter+''+level+'i'+index} id={leaf.word+''+letter+''+level+'i'+index}>{letter}</span>);
        
      });
      word.push(<span className="letter"> </span>);
      wordGroup.push(<div>{word} </div>);//i add the word to the word group
      
      if((this.state.wordList.indexOf(leaf.word)!=-1)&&(leaf.branch.length==0)){//this word is on the database and not already expanded
        wordGroup.push(<i className="material-icons" style={{color:'rgb(0,188,212)'}} onClick={()=>this.setState({graph:this.addBranch(this.state.graph,leaf.word,this.state.data)})}>add_circle</i>);//add an expand button
      }
      phrase.push(<span className="letter">{wordGroup} </span>);
    });

    graphJSX.push(<div className="phraseContainer">{phrase}</div>);
    graphJSX.push(spacer);

    var levelArray=[]
    for(var i=0;i<graph.length;i++){//this maps through diferent words looking for the ones that continue downwards
      if(graph[i].branch.length>0){
        levelArray.push(this.returnGraph(graph[i].branch,level+1));
      }
    }
    graphJSX.push(<div ref={'lvl'+level} className="level">{levelArray}</div>)
    return <div className="graph">{graphJSX}</div>;
  }

  render(){
    const graph=this.returnGraph(this.state.graph,0);
    const lines=this.drawLines(this.makeLines(this.state.graph));
  	return(
  	  <div className="container" ref="container" style={{direction:(this.state.currentSearch.search(/[\u0040-\u007A]/)>=0)?"LTR":"RTL"}}>
        <svg className="svgContainer" height={$(findDOMNode(this.refs.container)).css("height")} width={$(findDOMNode(this.refs.container)).css("width")}>
          {lines}
        </svg>
        <div>
    	  <AutoComplete
            className="inputBox"
            hintText="וֹטָרִיקוֹן"
            dir={(this.state.currentSearch.search(/[\u0040-\u007A]/)>=0)?"LTR":"RTL"}
            dataSource={this.state.wordList}
            onUpdateInput={(searchText)=>this.setState({currentSearch:searchText})}
          />
          <FloatingActionButton iconStyle={{height:30,width:30}} style={{height:30,width:30,marginRight:20}} onClick={()=>this.setState({graph:this.addBranch(null,this.state.currentSearch,this.state.data)})}>
            <ActionSearch />
          </FloatingActionButton>
        </div>
        {graph}
  	  </div>
  	)
  }
}
export default Graph;