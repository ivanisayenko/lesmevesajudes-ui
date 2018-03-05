//@flow
import React, { Component } from 'react';
import { LocalForm } from 'react-redux-form';
import IncomeDataFields from './BenefitsFields';



type Props = {
    adultName: ?string,
    onCancel: Function,
    onSubmit: Function,
}

class BenefitsForm extends Component<Props, {}> {
    state = {};
    onChange: Function;

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }
    onChange(e: any) {
        this.setState(e);
    }
    render() {
        return (
            <div>
                <h1>Ingressos de {this.props.adultName}</h1>
                <div className="FormContainer">
                    <LocalForm
                        onSubmit={this.props.onSubmit}
                        onChange={this.onChange}
                        //initialState={this.props.initialState}
                    >
                        <IncomeDataFields state={this.state}/>
                        <button className="CancelButton" onClick={this.props.onCancel}>Cancelar</button>
                        <button type="submit">Validar</button>
                    </LocalForm>
                </div>
            </div>
        );
    }
}

export default BenefitsForm;