import React from 'react';
import { Link } from 'react-router-dom'

class IndexPage extends React.Component {
    render() {
        return (
            <div>
                <Link to="/household/">
                    Find you possible benefits!
                </Link>
            </div>
        );
    }
}

export default IndexPage;