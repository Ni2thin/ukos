const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {create, act} = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/dashboard/NotesWidget.tsx'),'utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2021}
}).outputText;
const loaded = {exports:{}};
new Function('require','module','exports',code)(name => {
  if(name==='../ui/Card') return new Proxy({}, {get:()=>({children})=>React.createElement('div',null,children)});
  if(name==='../ui/Modal') return {Modal:({isOpen,children})=>isOpen?React.createElement('div',null,children):null};
  if(name==='lucide-react') return new Proxy({}, {get:()=>()=>null});
  return require(name);
},loaded,loaded.exports);
const {NotesWidget} = loaded.exports;
const note={id:'note-1',title:'Original title',content:'Saved text',category:'UK Life',updatedAt:'2026-10-08'};
function text(node){return typeof node==='string'?node:(node.children||[]).map(text).join('');}
function button(renderer,label){return renderer.root.findAllByType('button').find(node=>text(node).trim()===label);}
function field(renderer,label){return renderer.root.findByProps({'aria-label':label});}

test('note draft survives repeated sync object replacements and saves all edited fields to its original note', async()=>{
  let renderer; const saved=[];
  const props={notes:[note],onSaveNote:async n=>saved.push(n),onDeleteNote:async()=>{}};
  await act(async()=>{renderer=create(React.createElement(NotesWidget,props));});
  await act(async()=>button(renderer,'Edit Note').props.onClick());
  await act(async()=>{
    field(renderer,'Note title').props.onChange({target:{value:'Draft title'}});
    field(renderer,'Note content').props.onChange({target:{value:'First words, then more words.'}});
    field(renderer,'Note category').props.onChange({target:{value:'University'}});
  });
  for(let index=0;index<3;index++) await act(async()=>renderer.update(React.createElement(NotesWidget,{...props,notes:[{...note,content:'Remote refresh '+index}]})));
  assert.equal(field(renderer,'Note title').props.value,'Draft title');
  assert.equal(field(renderer,'Note content').props.value,'First words, then more words.');
  assert.equal(field(renderer,'Note category').props.value,'University');
  // Even removal/reordering by another device must not redirect this draft to another note.
  await act(async()=>renderer.update(React.createElement(NotesWidget,{...props,notes:[{...note,id:'note-2'}]})));
  await act(async()=>button(renderer,'Save').props.onClick());
  assert.equal(saved[0].id,'note-1');
  assert.equal(saved[0].content,'First words, then more words.');
  assert.equal(saved[0].title,'Draft title');
  assert.equal(saved[0].category,'University');
  await act(async()=>renderer.unmount());
});

test('failed note save retains the draft and exposes a retryable error', async()=>{
  let renderer;
  await act(async()=>{renderer=create(React.createElement(NotesWidget,{notes:[note],onSaveNote:async()=>{throw new Error('Storage full');},onDeleteNote:async()=>{}}));});
  await act(async()=>button(renderer,'Edit Note').props.onClick());
  await act(async()=>field(renderer,'Note content').props.onChange({target:{value:'Keep this draft'}}));
  await act(async()=>button(renderer,'Save').props.onClick());
  assert.equal(field(renderer,'Note content').props.value,'Keep this draft');
  assert.equal(text(renderer.root.findByProps({role:'alert'})),'Storage full');
  assert.equal(button(renderer,'Save').props.disabled,false);
  await act(async()=>renderer.unmount());
});

test('new note editor uses the created note before parent data has refreshed', async()=>{
  let renderer; let saved;
  await act(async()=>{renderer=create(React.createElement(NotesWidget,{notes:[note],onSaveNote:async n=>{saved=n;},onDeleteNote:async()=>{}}));});
  await act(async()=>button(renderer,'New Note').props.onClick());
  await act(async()=>renderer.root.findByProps({placeholder:'e.g. Bank Account details, Semester Exam Syllabus'}).props.onChange({target:{value:'New draft'}}));
  await act(async()=>renderer.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(field(renderer,'Note title').props.value,'New draft');
  assert.equal(field(renderer,'Note content').props.value,saved.content);
  await act(async()=>renderer.unmount());
});
