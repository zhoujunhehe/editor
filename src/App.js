import React, { Component } from 'react'
import './App.scss';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
const fs = window.fs
const electron = window.electron;

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      fileList:[],
      fileSrc:null,
      fileName:null
    }
  }
  registerEvent(){
    electron.ipcRenderer.on('open', (event, message) => {
      electron.remote.dialog.showOpenDialog({
        properties:['openDirectory']
      },(filename)=>{
        if(!filename){
          return 
        }
        this.setState({fileSrc:filename[0]})
        fs.readdir(filename[0],(err, files)=>{
          if (err) {
              return console.error(err);
          }
          let fileList = [];
          files.forEach((file)=> {
            fs.stat(filename[0]+ '/'+ file,(err, stats)=>{
              if (err) {
                return console.error(err);
              }
              if(stats.isFile() && file !== '.DS_Store'){
                fileList.push({ src: filename[0]+'/' + file ,name:file})
              }
            })
          });
          setTimeout(()=>this.setState({fileList:fileList}))
       });
      })
    })
    electron.ipcRenderer.on('save', (event, message) => {
      if(this.state.fileSrc){
        fs.writeFileSync(`${this.state.fileSrc}/${this.state.fileName}`,this.instance.getModel().getValue(), function(err) {
          if (err) {
              return console.error(err);
          }
       })
      }else{
        electron.remote.dialog.showSaveDialog((filename)=>{
          fs.writeFileSync(`${filename}`,this.instance.getModel().getValue(), function(err) {
            if (err) {
                return console.error(err);
            }
         })
        })
      }
    })
    electron.ipcRenderer.on('new', (event, message) => {
     let newModel = monaco.editor.createModel('new','javascript')
      this.instance.setModel(newModel)
      this.setState({fileSrc:null,fileName:null})
    })
  }
  clickName(e){
    
    fs.readFile(e.src,  (err, buffer) =>{
      this.setState({fileName:e.name})
      if (err) throw err;
      this.instance.getModel().setValue(buffer.toString(),e.name)
      // this.instance.setModel(model)
    });
    
  }
  componentDidMount(){

    this.registerEvent()

    this.instance = monaco.editor.create(document.getElementById("monaco"),{
          value:`console.log("hello,world")`,
          language:"javascript",
          suggestLineHeight: 20,
          lineHeight: 20,
          theme:'vs-dark',
          fontSize:18
    })
   
}
  componentWillUnmount() {
    this._editor && this._editor.dispose();
    this._subscription && this._subscription.dispose();
  }

  render() {
    return (<div style={{display:'flex'}}>
        <div className='Directory' >
          {this.state.fileList.map((v,i)=>{
            return <div onClick={()=>this.clickName(v)} key={i}>{v.name}</div>
          })}
        </div>
        <div id="monaco" className='monaco' style={{width:1000,height:1000}}></div>
      </div>
    )
  }
}

