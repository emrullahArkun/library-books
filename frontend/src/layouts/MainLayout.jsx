import { Outlet } from 'react-router-dom';
import Navbar from '../common/components/Navbar';

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

export default MainLayout;
