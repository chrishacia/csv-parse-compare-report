let React = require('react');
let {render} = require('react-dom');

let Logo = () => (
    <span className="__header__logo-container">
        <span className="__header__logo">
            <img src="./assets/dist/images/df-importer.png" />
        </span>
    </span>
)

let Nav = () => (
    <div className="__nav">
        <div className="__nav__bar">
            <div className="__nav__large">
                <Logo />

                <ul>
                    <li>
                        <a href="#" onClick={(e)=>{{e.preventDefault();alert('Magical Click!!')}}}>Importer</a>
                    </li>
                </ul>

            </div>
            <div className="__nav__small">

                <ul>
                    <li>
                        <a href="#" onClick={(e)=>{{e.preventDefault();alert('Sign off....')}}}>Sign Off</a>
                    </li>
                </ul>

            </div>
        </div>
    </div>
)

render(<Nav />, document.querySelector('.js__nav-target'));

