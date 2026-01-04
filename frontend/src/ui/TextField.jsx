import React, { forwardRef } from 'react';
import './TextField.css';

export const TextField = forwardRef(({
    label,
    error,
    leftIcon,
    rightElement,
    type = 'text',
    id,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`ui-field ${containerClassName}`}>
            <div className={`ui-field__input-wrapper ${error ? 'ui-field__input-wrapper--error' : ''}`}>
                {leftIcon && <span className="ui-field__icon ui-field__icon--left">{leftIcon}</span>}

                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`ui-field__input ${leftIcon ? 'ui-field__input--has-left-icon' : ''}`}
                    placeholder=" " /* Required for css :placeholder-shown trick */
                    {...props}
                />

                {label && (
                    <label
                        htmlFor={inputId}
                        className={`ui-field__label ${leftIcon ? 'ui-field__label--has-left-icon' : ''}`}
                    >
                        {label}
                    </label>
                )}

                {rightElement && <div className="ui-field__right-element">{rightElement}</div>}
            </div>

            {error && <span className="ui-field__error">{error}</span>}
        </div>
    );
});

TextField.displayName = 'TextField';
