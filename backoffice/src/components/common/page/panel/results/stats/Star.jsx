import React from 'react';
import PropTypes from 'prop-types';
import star from './Star.png';
import './Star.scss';

const Star = props => {
    let className = `Star ${props.className || ''}`;
    if (!props.svg) {
        return (<img src={star} className={className} alt="star" />);
    }
    return (<i className={`${className} fas fa-star`}></i>);
};

Star.propTypes = {
    svg: PropTypes.bool,
    className: PropTypes.string,
};
Star.defaultProps = {
    svg: true,
};

export default Star;
