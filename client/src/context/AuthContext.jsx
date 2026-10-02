

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {


    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {

            const userData = JSON.parse(storedUser);

            setUser(userData);
        }

        setLoading(false);

    }, []);


    // Login //
    const login = async (email, password) => {

        const response = await api.post("/auth/login", {
            email: email,
            password: password
        });


        const token = response.data.token;
        const loggedInUser = response.data.user;


        localStorage.setItem("token", token); 

        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );


        setUser(loggedInUser);


        return loggedInUser;
    };


    // Register //
    const register = async (name, email, password) => {

        const response = await api.post("/auth/register", {
            name: name,
            email: email,
            password: password
        });

        return response.data;
    };


    // Logout //
    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);
    };

    const updateStoredUser = (updatedUser) => {

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
    };


    return (

        <AuthContext.Provider
            value={{
                user: user,
                loading: loading,

                isAuthenticated: user !== null,

                isAdmin: user?.role === "admin",

                login: login,
                register: register,
                logout: logout,
                updateStoredUser: updateStoredUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {

    return useContext(AuthContext);
};


export default AuthContext;