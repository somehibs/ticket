import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

import SessionActions     from 'actions/session-actions';
import SessionStore from 'lib-app/session-store';
import CreateTicketForm from 'app/main/dashboard/dashboard-create-ticket/create-ticket-form';

import Widget from 'core-components/widget';

class DashboardCreateTicketPage extends React.Component {

    static propTypes = {
        userSystemEnabled: React.PropTypes.bool
    };

    render() {
        let Wrapper = 'div';

        Wrapper = Widget;

        return (
            <div className={this.getClass()}>
                <Wrapper>
                    <CreateTicketForm
                        userLogged={false}
			selectedDepartment={this.getDepartmentSelection()}
                        onSuccess={this.onCreateTicketSuccess.bind(this)}/>
                </Wrapper>
            </div>
        );
    }

    getDepartmentSelection() {
	var route = this.props.location.pathname
	var department
	if (route.indexOf("content-apply") !== -1) {
	    department = "Content applications"
	} else if (route.indexOf("apply") !== -1) {
	    department = "Tripsitter applications"
	} else if (route.indexOf("appeal") !== -1) {
	    department = "Ban appeals"
	}
	if (department !== undefined) {
		// Fetch the deparments, find the index of this department (in case db order changes)
		var i = 0
		for (let dept of SessionStore.getDepartments()) {
			if (dept.name === department) {
				return i
			}
			i += 1
		}
	}
	return -1
    }

    onCreateTicketSuccess() {
//        if((this.props.location.pathname !== '/create-ticket')) {
//            this.props.dispatch(SessionActions.getUserData());
//            setTimeout(() => {history.push('/dashboard')}, 2000);
//        } else {
            setTimeout(() => {history.push('/check-ticket/' + result.data.ticketNumber + '/' + email)}, 1000);
//}
    }

    getClass() {
        let classes = {
            'dashboard-create-ticket-page': true,
            'dashboard-create-ticket-page_wrapped': true,
            'col-md-10 col-md-offset-1': (!this.props.config['user-system-enabled'])
        };

        return classNames(classes);
    }
}

export default connect((store) => {
    return {
        config: store.config
    };
})(DashboardCreateTicketPage);
