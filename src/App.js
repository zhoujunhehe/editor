import React, { Component } from 'react';
import './App.scss';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import j from 'jscodeshift';
import jsxColoringProvider from './jsx/JSXColoringProvider';
const fs = window.fs;
const electron = window.electron;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      fileSrc: null,
      fileName: null,
    };
  }
  registerEvent() {
    electron.ipcRenderer.on('open', (event, message) => {
      electron.remote.dialog.showOpenDialog(
        {
          properties: ['openDirectory'],
        },
        filename => {
          if (!filename) {
            return;
          }

          this.setState({ fileSrc: filename[0] },()=>{
            localStorage.setItem('src',this.state.fileSrc)
            this.opendir()
          } );
          
        },
      );
    });
    electron.ipcRenderer.on('save', (event, message) => {
      if (this.state.fileSrc) {
        fs.writeFileSync(
          `${this.state.fileSrc}`,
          this.instance.getModel().getValue(),
          function(err) {
            if (err) {
              return console.error(err);
            }
          },
        );
      } else {
        electron.remote.dialog.showSaveDialog(filename => {
          fs.writeFileSync(`${filename}`, this.instance.getModel().getValue(), function(err) {
            if (err) {
              return console.error(err);
            }
          });
        });
      }
    });
    electron.ipcRenderer.on('new', (event, message) => {
      let newModel = monaco.editor.createModel('new', 'javascript');
      this.instance.setModel(newModel);
      this.setState({ fileSrc: null, fileName: null });
    });
    electron.ipcRenderer.on('copyline', (event, message) => {
      // let num = this.instance.getModel().
      let line =this.instance.getModel().getAllDecorations()
      console.log(line)
    });
  }
  opendir(src = localStorage.getItem('src')){
    fs.readdir(src, (err, files) => {
      if (err) {
        return console.error(err);
      }
      localStorage.setItem('src',src)
      let fileList = [];
      files.forEach(file => {
        fs.stat(src + '/' + file, (err, stats) => {
          if (err) {
            return console.error(err);
          }
          if (stats.isFile() && file !== '.DS_Store') {
            fileList.push({ src: src + '/' + file, name: file ,type:'file'});
          }else if(stats.isDirectory()){
            fileList.push({ src: src + '/' + file, name: file ,type:'dir'});
          }

        });
      });
      setTimeout(() => this.setState({ fileList: fileList }));
    });
  }
  clickName(e) {
    fs.readFile(e.src, (err, buffer) => {
      
      if (err) throw err;
      this.setState({fileSrc:e.src})
      let type = e.name.substr(e.name.lastIndexOf('.') + 1);

      const type2str = {
        js: 'javascript',
        jsx: 'javascript',
        html: 'html',
        css: 'css',
        less: 'css',
        scss: 'css',
      };
      if (type == 'jsx' || type == 'js'  ) {
        let newmodel = monaco.editor.createModel(buffer.toString(), type2str[type]);
        this.instance.setModel(newmodel);
        setTimeout(() => {
          let ast = j(buffer.toString());

          let JSXColoringProvider = new jsxColoringProvider(
            window.monaco,
            j,
            'monaco',
            this.instance,
          );
  
         let arr =  JSXColoringProvider.colorize(ast);
          this.dec =  this.instance.deltaDecorations(arr,arr)
        }, 0);
   
      } else {
        let newmodel = monaco.editor.createModel(buffer.toString(), type2str[type]);
        this.instance.setModel(newmodel);
      }
    });
  }
  componentDidMount() {
    this.registerEvent();
    if(localStorage.getItem('src')){
      this.opendir()
    }
    this.instance = monaco.editor.create(document.getElementById('monaco'), {
      value: `console.log("hello,world")`,
      language: 'javascript',
      suggestLineHeight: 20,
      lineHeight: 20,
      theme: 'vs-dark',
      fontSize: 18,
    });
  }
  componentWillUnmount() {
    this._editor && this._editor.dispose();
    this._subscription && this._subscription.dispose();
  }
  back(){
    let url =  localStorage.getItem('src').substr(0,localStorage.getItem('src').lastIndexOf('/'))
    this.opendir(url)
  }
  renderList(list = this.state.fileList){
    return list.map((v, i) => {
      if(v.type==='file'){
        return   (
          <div onClick={() => this.clickName(v)} key={i}>
            {`📃`+v.name}
          </div>
        );
      }else if(v.type==='dir'){
        return   (
          <div onClick={() => {
            this.opendir(v.src)
            }} key={i}>
            {`📦`+v.name}
          </div>
        );
      }
    })
  }
  
  render() {
    return (
      <div style={{ display: 'flex' }}>
       
        <div className="Directory">
        <div onClick={()=>this.back()}>
        {`⬅️`}

        </div>
        {this.renderList()}
        </div>
        <div id="monaco" className="monaco"></div>
      </div>
    );
  }
}
