import React from 'react';

const Rating = ({ value, max }) => {
    const stars = [];

    for (let i = 1; i <= max; i++) {
        stars.push(
            <span key={i} className={i <= value ? 'star filled' : 'star'}>
                <i className="fas fa-star"></i>
            </span>
        );
    }

    return <div className="rating">{stars}</div>;
};

export default Rating;