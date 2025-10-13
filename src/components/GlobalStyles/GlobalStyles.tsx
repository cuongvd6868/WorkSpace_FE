import React from "react";
import './GlobalStyles.scss';

interface GlobalStylesProps {
    children: any;
}

const GlobalStyles: React.FC<GlobalStylesProps> = ({children}) => {
    return children
}

export default GlobalStyles;