import React from 'react';


// Simple styled component for modularity (or plain CSS modules, but let's stick to inline style logic or CSS modules for simplicity if we can't install new deps. 
// Wait, user said "no libraries" except Chakra removal. 
// I will use CSS Modules or just scoped CSS. Or Token-based style objects.
// Actually, standard modern approach without Chakra: either CSS Modules or Tailwind. 
// User didn't specify technology, but said "Design Tokens (CSS Variables)".
// So I will use standard CSS + BEM-like classes or Utility classes. 
// Let's use CSS Modules for cleanliness? Or just a simple `src/ui/Button.css`.
// Let's create `Button.css` alongside.

// For now, I will write the component to use CSS Modules-like classNames imported from a css file, 
// or I'll put the styles in a new css file. 
// I'll assume I can create `Button.css` next.

import './Button.css';

export const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    leftIcon,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`ui-btn ui-btn--${variant} ${isLoading ? 'ui-btn--loading' : ''} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <span className="ui-btn__spinner" />}
            {!isLoading && leftIcon && <span className="ui-btn__icon">{leftIcon}</span>}
            <span className={isLoading ? 'ui-btn__content--hidden' : 'ui-btn__content'}>
                {children}
            </span>
        </button>
    );
};
