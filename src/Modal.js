import React, { Component } from 'react';

class Modal extends Component {
	render() {
		return (
			<div>
				{this.props.isVisible ?(
					<div id="modal">
						<span className="close-modal" onClick={this.props.modalClosed}>X</span>
						<h1>{this.props.title}</h1>
						<div id="images"></div>
					</div>
				):null}
			</div>
		)
	}
}

export default Modal