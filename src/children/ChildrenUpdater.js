//@flow
import React, {Component} from 'react';
import {LocalForm} from 'react-redux-form';
import ChildrenFields from './ChildrenFields';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

class ChildrenUpdater extends Component {
    render() {
        return (
            <div>
                <h1>Update Child information</h1>
                <LocalForm >
                    <ChildrenFields {...this.props.child} />
                    <Link to="/children">
                        <button>
                        Update
                        </button>
                    </Link>
                </LocalForm>
            </div>);
    }
}


function mapStateToProps(state, ownProps) {
    console.log("child: "+JSON.stringify(state.children.get(ownProps.match.params.id)));
    return {child: state.children.get(ownProps.match.params.id)};
}

export default connect(mapStateToProps, null)(ChildrenUpdater);