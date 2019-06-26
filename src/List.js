import React, { Component } from 'react';

class List extends Component {
	state = {

	}
	render() {
		return (
			<div id='side-bar'>
	            <input
		            id='input-box-text'
		            type='text'
		            placeholder='Locais em Colinas da Anhanguera'
		            aria-label="text filter"
		            value={this.state.query}
		            onChange={e=>this.props.updateQuery(e.target.value)}
	            />
	            <ul
	            	aria-label = 'Lista de locais'>
	            	{this.props.workingList.map(location =>
			            <li
				            data-key={location.id}
				            key={location.id}
				            role="button"
				            tabIndex={ !this.state.searchHidden ? '0' : '-1' }
				            onClick={e=>this.props.handleClick(e)}>
				            {location.name}
			            </li>
	            	)}
	            </ul>
            </div>
		)
	}
}

export default List;