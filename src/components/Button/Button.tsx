import React from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from './Button.module.scss';

const cx = classNames.bind(styles);

interface ButtonProps {
    children: React.ReactNode;
    to?: string;
    href?: string;
    primary?:boolean;
    text?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}


const Button: React.FC<ButtonProps> = ({
    children,
    to,
    href,
    primary,
    text = false,
    disabled = false,
    onClick,
    leftIcon,
    rightIcon,
    className,
    ...passProps
}) => {
    let Comp: React.ElementType = 'button';
    const props: any = {
        onClick,
        ...passProps
    };

    if (disabled) {
        Object.keys(props).forEach((key) => {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                delete props[key];
            }
        });
        // delete props.onClick
    }

    if(to) {
        props.to = to;
        Comp = Link;
    }else if (href) {
        props.href = href;
        Comp = 'a'
    }

    const classes = cx('wrapper', {
        [className as string]: className, 
        primary,
        text,
        disabled
    });


    return(
        <Comp className={classes} {...props}>
            {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
              <span className={cx('title')}>{children}</span>
            {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
        </Comp>
    )
}

export default Button;