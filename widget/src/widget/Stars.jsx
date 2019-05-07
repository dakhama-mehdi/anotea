import React from 'react';
import PropTypes from 'prop-types';

import styles from './stars.css.js';

const MAX_STARS = 5;

export default class Stars extends React.PureComponent {

    state = {
        starArray: []
    }

    static propTypes = {
        value: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);
        if (props.value !== null) {
            this.state.starArray = new Array(MAX_STARS)
            .fill('star', 0, props.value)
            .fill('star_empty', props.value, MAX_STARS);
        }
    }

    render() {
        return (
            <span className="stars">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossOrigin="anonymous"></link>
                <style>
                    {styles}
                </style>
                {
                    this.state.starArray.map((star, index) =>
                        <span
                            key={index}
                            className={star === 'star_empty' ? 'fas fa-star' : 'fas fa-star active'}
                            style={{ width: '18px' }}
                        />
                    )
                }
            </span>
        );
    }
}
