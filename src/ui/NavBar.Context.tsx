import React, { createContext, useContext, useState } from "react";
const NavBarContext = createContext({
    leftInset: 0,
    setHeight(height: number) {},
    height: 0,
});

export function NavBarContextProvider(props: {
    leftInset?: number;
    children: React.ReactNode;
}) {
    const [height, setHeight] = useState(0);
    return (
        <NavBarContext.Provider
            value={{
                leftInset: props.leftInset ?? 0,
                setHeight,
                height,
            }}
        >
            {props.children}
        </NavBarContext.Provider>
    );
}

export function useNavBarContext() {
    return useContext(NavBarContext);
}
