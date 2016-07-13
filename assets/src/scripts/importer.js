let React = require('react');
let {render} = require('react-dom');
let Importer = require('./modules/importer-view.jsx');

render(<Importer />, document.querySelector('.js__content-target'));
