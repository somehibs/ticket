import React, {Fragment}              from 'react';
import _                  from 'lodash';
import {connect} from 'react-redux';

import history            from 'lib-app/history';
import i18n               from 'lib-app/i18n';
import API                from 'lib-app/api-call';
import SessionStore       from 'lib-app/session-store';
import LanguageSelector   from 'app-components/language-selector';
import Captcha            from 'app/main/captcha';

import Header             from 'core-components/header';
import TextEditor         from 'core-components/text-editor';
import Form               from 'core-components/form';
import FormField          from 'core-components/form-field';
import CheckboxGroup from 'core-components/checkbox-group';
import SubmitButton       from 'core-components/submit-button';
import Message            from 'core-components/message';

class CreateTicketForm extends React.Component {

    static propTypes = {
        userLogged: React.PropTypes.bool,
        onSuccess: React.PropTypes.func,
    };

    static defaultProps = {
        userLogged: true,
        fieldMatch: /\[([a-zA-Z\*]+) ([a-zAi -Z\-]+) *(["a-zA-Z ]*)\]/
    };

    state = {
        loading: false,
        message: null,
        form: {
            title: '',
            content: TextEditor.createEmpty(),
            departmentIndex: 0,
            email: '',
            name: '',
            language: this.props.language
        }
    };

    render() {
        return (
            <div className="create-ticket-form">
                <Header title={i18n('CREATE_TICKET')} description={i18n('CREATE_TICKET_DESCRIPTION')} />
                <Form {...this.getFormProps()}>
                    {(!this.props.userLogged) ? this.renderEmailAndName() : null}
		{false?<FormField label={i18n('TITLE')} name="title" validation="TITLE" required field="input" fieldProps={{size: 'large'}}/>:null}
                    <div className="row">
		{(this.props.selectedDepartment === -1) ? <FormField className="col-md-5" label={i18n('DEPARTMENT')} name="departmentIndex" field="select" fieldProps={{
                            items: SessionStore.getDepartments().map((department) => {return {content: department.name}}),
                            size: 'medium'
                        }} /> : null}
                    </div>
		{this.renderDepartmentTemplate()}
                    {(this.props.allowAttachments) ? this.renderFileUpload() : null}
                    {(!this.props.userLogged) ? this.renderCaptcha() : null}
                    <SubmitButton>{i18n('CREATE_TICKET')}</SubmitButton>
                </Form>
                {this.renderMessage()}
            </div>
        );
    }

    decomposeTemplate(tpl) {
	    const fieldRegex = /(\[[a-zA-Z\*]+ [a-zA-Z\-]+ *["a-zA-Z ]*\])/g
	    return tpl.split(fieldRegex)
    }

    renderTemplate(tpl) {
	    if (tpl === null) {
		    return "This department is not ready for new tickets yet."
	    }
	    //tpl = tpl.replace(/</br>/g, '')
	    var matched = this.decomposeTemplate(tpl)
	    var rendered = []
	    var checkboxes = []
	    for (let i in matched) {
		    if (i == matched.length-1) {
			    break
		    }
		    const match = matched[i]
		    var fields = match.match(this.props.fieldMatch)
		    var checkboxed = 0
		    if (fields !== null) {
			    var req = false
			    if (fields[1].indexOf("*") === fields[1].length-1) {
				    fields[1] = fields[1].substring(0, fields[1].length-1)
				    req = true
			    }
			    if (fields[1].indexOf("checkbox") === 0) {
				    // Checkbox.
				    // Store each field in a list until you see a non-checkbox field, then render them all
				    checkboxed = 1
				    var fieldType = fields[2].split(' ', 1)[0]
				    var fieldName = fields[2].substring(fieldType.length)
				    console.log("Field type: " + fieldType)
				    console.log("Field name: " + fieldName)
				    checkboxes.push(fieldName.substring(2, fieldName.length-1))
			    } else if (fields[1].indexOf("textarea") === 0) {
				    rendered.push(<FormField key={i} name={"template__"+fields[2]} required={req} validation="TEXT_AREA" decorator={"textarea"}/>)
			    } else if (fields[1].indexOf("text") === 0) {
				    rendered.push(<FormField key={i} name={"template__"+fields[2]} validation="TEXT_AREA" type="text"/>)
			    } else {
				    rendered.push(<span key={i}>Unknown field {fields[1]}</span>)
			    }
		    } else {
			    rendered.push(<div key={i} dangerouslySetInnerHTML={{__html:match}}/>)
		    }
		    if (checkboxes.length > 0 && checkboxed == 0) {
			    // Render all of the checkboxes in one group
			    rendered.push(<CheckboxGroup items={checkboxes} />)
			    checkboxes = []
		    }
	    }
	    return rendered
    }

    renderDepartmentTemplate() {
	    if (this.props.selectedDepartment !== -1) {
		    this.state.form.departmentIndex = this.props.selectedDepartment
	    }
	    if (this.state.form.departmentIndex === undefined) {
		    this.state.form.departmentIndex = 0
	    }
	    this.state.selectedDepartment = this.getDepartment(this.state.form.departmentIndex)
	    const template = this.renderTemplate(this.state.selectedDepartment.template)
	    return (<div style={{'textAlign':'left'}}>{template}</div>)
    }

    getDepartment(index) {
	return SessionStore.getDepartments()[index]
    }

    renderEmailAndName() {
        return (
            <div className="row">
                <FormField className="col-md-6" label={i18n('EMAIL')} name="email" validation="EMAIL" required field="input" fieldProps={{size: 'large'}}/>
                <FormField className="col-md-6" label={i18n('NICK')} name="name" validation="NAME" required field="input" fieldProps={{size: 'large'}}/>
            </div>
        );
    }

    renderFileUpload() {
        return (
            <div className="create-ticket-form__file">
                <FormField name="file" field="file" />
            </div>
        );
    }

    renderCaptcha() {
        return (
            <div className="create-ticket-form__captcha">
                <Captcha ref="captcha"/>
            </div>
        );
    }

    renderMessage() {
        switch (this.state.message) {
            case 'success':
                return <Message className="create-ticket-form__message" type="success">{i18n('TICKET_SENT')}</Message>;
            case 'fail':
                return <Message className="create-ticket-form__message" type="error">{i18n('TICKET_SENT_ERROR')}</Message>;
	case 'empty':
                return <Message className="create-ticket-form__message" type="error">Please fill in at least one field.</Message>;
            default:
                return null;
        }
    }

    getFormProps() {
        return {
            loading: this.state.loading,
            onSubmit: this.onSubmit.bind(this),
            values: this.state.form,
            onChange: form => this.setState({form})
        };
    }

	templateToContent(form) {
		if (this.state.selectedDepartment.template === null) {
			throw "Cannot submit form without template"
		}
	        var content = this.decomposeTemplate(this.state.selectedDepartment.template)
		var atLeastOneFieldFilled = false
		form['content'] = ''
		for (let i in content) {
			if (content[i] === undefined) {
				break
			}
			var field = content[i]
			if (field === undefined || field.match === undefined) {
				console.log("Warning, could not find " + i + " in content")
				continue
			}
			var decomposedField = field.match(this.props.fieldMatch)
			if (decomposedField !== null) {
				var decompName = 'template__'+decomposedField[2]
				if (decompName in form) {
					atLeastOneFieldFilled = true
					form['content'] += '\r\n['+decomposedField[2] + ']\r\n'
					form['content'] += form[decompName]+'\r\n'
				} else {
					form['content'] += '\r\n['+decomposedField[2] + ' missing]\r\n'
					//checkbox?
					//console.log("Field " + decomposedField[2] + " has no form data")
				}
				delete form[decompName]
			} else {
				console.log('content: ' + field)
				form['content'] += field + '</br>'
			}
		}
		if (atLeastOneFieldFilled === false) {
			return undefined
		}
		return form
	}

    onSubmit(formState) {
        let captcha = this.refs.captcha && this.refs.captcha.getWrappedInstance();

        if (captcha && !captcha.getValue()) {
            captcha.focus();
        } else {
		formState = this.templateToContent(formState)
		if (formState === undefined) {
		        this.setState({
		            loading: false,
		            message: 'empty'
		        });
			return
		}
            formState.title = SessionStore.getDepartments()[formState.departmentIndex].name
            this.setState({
                loading: true
            });

            API.call({
                path: '/ticket/create',
                dataAsForm: true,
                data: _.extend({}, formState, {
                    captcha: captcha && captcha.getValue(),
                    departmentId: SessionStore.getDepartments()[formState.departmentIndex].id
                })
            }).then(this.onTicketSuccess.bind(this, formState.email)).catch(this.onTicketFail.bind(this));
        }
    }

    onTicketSuccess(email, result) {
        this.setState({
            loading: false,
            message: 'success'
        }, () => {
            if(this.props.onSuccess) {
                this.props.onSuccess();
            }
        });
    }

    onTicketFail() {
        this.setState({
            loading: false,
            message: 'fail'
        });
    }
}

export default connect((store) => {
    const { language, supportedLanguages } = store.config;

    return {
        language: _.includes(supportedLanguages, language) ? language : supportedLanguages[0],
        allowAttachments: store.config['allow-attachments']
    };
})(CreateTicketForm);
