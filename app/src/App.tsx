import React, { FunctionComponent, useEffect, lazy, Suspense } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    useParams,
} from 'react-router-dom';
// import loadable from '@loadable/component';
import ReactTooltip from 'react-tooltip';

import DropAnimation from "@components/shared/DropAnimation";
import SideMenu from "@shared/SideMenu";
import ModalRoutes from "@components/ModalRoutes";

export default function App() {

    const Loader = ({ component }: any) =>
        <Suspense fallback={
            <div className="d-flex align-items-center justify-content-center min-vh-100 mt-n5">
                <DropAnimation />
            </div>
        }>
            {component}
        </Suspense>;
    const Home = lazy(() => import('@components/routes/Home'));
    const Group = lazy(() => import('./components/routes/Group'));
    const Question = lazy(() => import('./components/routes/Question'));
    const Profile = lazy(() => import('./components/routes/Profile'));
    const ProfilePeople = lazy(() => import('./components/routes/Profile/ProfilePeople'));
    const ProfileFollowings = lazy(() => import('./components/routes/Profile/ProfileFollowings'));
    // const Trending = lazy(() => import('./components/routes/Trending'));
    const Feed = lazy(() => import('./components/routes/Feed'));
    const Notifications = lazy(() => import('./components/routes/Notifications'));
    const Groups = lazy(() => import('./components/routes/Groups'));
    const GroupPeople = lazy(() => import('./components/routes/GroupPeople'));
    const Admin = lazy(() => import('./components/routes/Admin'));


    return (
        <div className={`AppContainer theme3`}>
            <ReactTooltip place="bottom" type="dark" effect="solid" />
            <BrowserRouter>
                <>
                    <ScrollToTop />
                    <SideMenu />
                    <div className="App border-sides">
                        <Routes>
                            <Route path="/invite/by/:inviterHandle/to/group/:handle" element={<Loader component={<Group />} />} />
                            <Route path="/invite/by/:inviterHandle/to/group/:handle/:acceptOnLogin" element={<Loader component={<Group />} />} />
                            <Route path="/invite/by/:inviterHandle/to/causeOnProfile/:groupHandle" element={<Loader component={<Profile />} />} />
                            <Route path="/invite/by/:inviterHandle/toCompareWith/:handle" element={<Loader component={<Profile />} />} />
                            <Route path="/invite/by/:inviterHandle/to/voteOn/:voteName/:groupHandle" element={<Loader component={<Question />} />} />

                            <Route path="/poll/:voteName/:groupHandle/:section/:subsection/:subsubsection" element={<Loader component={<Question />} />} />
                            <Route path="/poll/:voteName/:groupHandle/:section/:subsection" element={<Loader component={<Question />} />} />
                            <Route path="/poll/:voteName/:groupHandle/:section" element={<Loader component={<Question />} />} />
                            <Route path="/poll/:voteName/:groupHandle" element={<Loader component={<Question />} />} />
                            <Route path="/multipoll/:voteName/:groupHandle/:section/:subsection/:subsubsection" element={<Loader component={<Question />} />} />
                            <Route path="/multipoll/:voteName/:groupHandle/:section/:subsection" element={<Loader component={<Question />} />} />
                            <Route path="/multipoll/:voteName/:groupHandle/:section" element={<Loader component={<Question />} />} />
                            <Route path="/multipoll/:voteName/:groupHandle" element={<Loader component={<Question />} />} />
                            <Route path="/profile/:handle/cause/:groupHandle" element={<Loader component={<Profile />} />} />
                            <Route path="/profile/:handle/:section/:subsection/:subsubsection" element={<Loader component={<Profile />} />} />
                            <Route path="/profile/:handle/:section/:subsection" element={<Loader component={<Profile />} />} />
                            <Route path="/profile/:handle/:section" element={<Loader component={<Profile />} />} />
                            <Route path="/profile/:handle" element={<Loader component={<Profile />} />} />
                            <Route path="/profile" element={<Loader component={<Profile />} />} />
                            <Route path="/profile-people/:handle/:which" element={<Loader component={<ProfilePeople />} />} />
                            <Route path="/profile-follows/:handle/:which" element={<Loader component={<ProfileFollowings />} />} />
                            {/* <Route path="/trending" element={<>{loadable(() => import('./components/routes/Trending'))}</>} /> */}
                            <Route path="/home/:section" element={<Loader component={<Feed />} />} />
                            <Route path="/home" element={<Loader component={<Feed />} />} />
                            <Route path="/notifications/:section" element={<Loader component={<Notifications />} />} />
                            <Route path="/notifications" element={<Loader component={<Notifications />} />} />
                            <Route path="/groups/:section" element={<Loader component={<Groups />} />} />
                            <Route path="/groups" element={<Loader component={<Groups />} />} />
                            <Route path="/group/:handle/:section/:subsection/:subsubsection" element={<Loader component={<Group />} />} />
                            <Route path="/group/:handle/:section/:subsection" element={<Loader component={<Group />} />} />
                            <Route path="/group/:handle/:section" element={<Loader component={<Group />} />} />
                            <Route path="/group/:handle" element={<Loader component={<Group />} />} />
                            <Route path="/group-people/:handle/:which" element={<Loader component={<GroupPeople />} />} />
                            <Route path="/admin" element={<Loader component={<Admin />} />} />
                            <Route path="/admin/:section" element={<Loader component={<Admin />} />} />
                            <Route path="/" element={<Loader component={<Feed />} />} />
                        </Routes>
                        <div className="p-4 d-md-none"></div>
                    </div>
                    {/* <SideInfo /> */}
                    <ModalRoutes />
                </>
            </BrowserRouter>
        </div>
    );
}

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // const numberOfSlashes = pathname.split("/").length - 1;

        const navigatingToUserGroupOnProfile = pathname.split("/")[3] === 'cause';

        if (!navigatingToUserGroupOnProfile) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
