import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice/userSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isClient, setIsClient] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsClient(true); // Ensure this runs only on the client
        
        const user = localStorage.getItem("user");
        if (user) {
            dispatch(setUser(JSON.parse(user)));
            setIsAuthenticated(true);
        } else {
            router.push("/auth/login");
        }
    }, [router, dispatch]);

    if (!isClient) return null; // Prevent hydration mismatch

    return isAuthenticated ? children : null;
}
