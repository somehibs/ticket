import React from 'react';

import MainLayout from 'app/main/main-layout';
import AdminPanelStaffWidget from 'app/admin/panel/admin-panel-staff-widget';
import AdminPanelMenu from 'app/admin/panel/admin-panel-menu';
import API from 'lib-app/api-call.js';

import Widget from 'core-components/widget';

class AdminPanel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {logged_out: false};
		API.logoutAlert = this.logoutAlert.bind(this);
	}

    render() {
        return (
            <MainLayout>
                <div className="admin-panel-layout">
			{this.maybeRenderLogoutWarning()}
                    <div className="row admin-panel-layout__header">
                        <div className="col-md-3">
                            <AdminPanelStaffWidget />
                        </div>
                        <div className="col-md-9">
                            <AdminPanelMenu location={this.props.location} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 admin-panel-layout__content">
                            <Widget>
                                {this.props.children}
                            </Widget>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

	logoutAlert(loggedOut) {
		this.setState({
			logged_out: loggedOut
		})
	}

	maybeRenderLogoutWarning() {
	    if (this.state.logged_out) {//API.logoutAlert) {
		    return (<div className="logout-alert">Warning - you may have been logged out. Please copy any comments before logging out and logging in again.</div>);
	    }
	}
}

export default AdminPanel;
