import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";

// StoreProvider - Wraps the application with Redux store
const StoreProvider = ({ children }) => {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
};
export default StoreProvider;