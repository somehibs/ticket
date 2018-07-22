import React              from 'react';
import {connect}          from 'react-redux';
import classNames         from 'classnames';

class MainLayoutFooter extends React.Component {

    render() {
        return (
            <div className={this.getClass()}>
                {(this.props.adminPanelOpened) ? this.renderExtraLinks() : null}
                <div className="main-layout-footer__powered">
                </div>
            </div>
        );
    }

    renderExtraLinks() {
	return null
        return (
            <div className="main-layout-footer__extra-links">
            </div>
        );
                /*<a className="main-layout-footer__extra-link" href="http://www.opensupports.com/documentation/" target="_blank">Documentation</a>
                <span> | </span>
                <a className="main-layout-footer__extra-link" href="http://www.opensupports.com/download/#donation" target="_blank">Donate</a>*/
    }

    getClass() {
        let classes = {
            'main-layout-footer': true,
            'main-layout-footer_admin-panel': this.props.adminPanelOpened
        };

        return classNames(classes);
    }
}

export default connect((store) => {
    return {
        adminPanelOpened: store.session.staff
    };
})(MainLayoutFooter);
