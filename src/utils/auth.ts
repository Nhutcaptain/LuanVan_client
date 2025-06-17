export const isLoggedIn = () => {
    if(typeof window === 'undefined') return false; // Ensure this runs in the browser
    const token = localStorage.getItem('token');
    return !!token;
}