import React, { FunctionComponent, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useLocation,
    useParams
} from 'react-router-dom';
import loadable from '@loadable/component';
import ReactTooltip from 'react-tooltip';

import SideMenu from "@shared/SideMenu";
import SideInfo from "@shared/SideInfo";
import ModalRoutes from "@components/ModalRoutes";

export default function App() {

    return (
        <div className={`AppContainer theme3`}>
            <ReactTooltip place="bottom" type="dark" effect="solid" />
            <Router>
                <ScrollToTop />
                <SideMenu />
                <div className="App border-sides">
                    <Switch>
                        <Route path="/poll/:voteName/:groupChannel/:section/:subsection/:subsubsection" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/poll/:voteName/:groupChannel/:section/:subsection" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/poll/:voteName/:groupChannel/:section" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/poll/:voteName/:groupChannel" component={loadable(() => import('./components/Routes/Question'))} />
                        
                        <Route path="/multipoll/:voteName/:groupChannel/:section/:subsection/:subsubsection" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupChannel/:section/:subsection" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupChannel/:section" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupChannel" component={loadable(() => import('./components/Routes/Question'))} />
                        <Route path="/grouping/:groupType/:groupFilter" component={loadable(() => import('./components/Routes/Grouping'))} />
                        <Route path="/register" component={loadable(() => import('./components/Routes/CreateProfile'))} />
                        <Route path="/create-vote" component={loadable(() => import('./components/Routes/CreateVote'))} />
                        <Route path="/create-vote/:groupName" component={loadable(() => import('./components/Routes/CreateVote'))} />
                        {/* <Route path="/create-sub-vote/:voteName" component={loadable(() => import('./components/Routes/CreateVote'))} /> */}
                        <Route path="/profile/:handle/:section/:subsection/:subsubsection" component={loadable(() => import('./components/Routes/Profile'))} />
                        <Route path="/profile/:handle/:section/:subsection" component={loadable(() => import('./components/Routes/Profile'))} />
                        <Route path="/profile/:handle/:section" component={loadable(() => import('./components/Routes/Profile'))} />
                        <Route path="/profile/:handle" component={loadable(() => import('./components/Routes/Profile'))} />
                        <Route path="/profile" component={loadable(() => import('./components/Routes/Profile'))} />
                        <Route path="/profile-people/:handle/:which" component={loadable(() => import('./components/Routes/ProfilePeople'))} />
                        <Route path="/trending" component={loadable(() => import('./components/Routes/Trending'))} />
                        <Route path="/feed" component={loadable(() => import('./components/Routes/Feed'))} />
                        <Route path="/groups" component={loadable(() => import('./components/Routes/Groups'))} />
                        <Route path="/group/:handle/:section/:subsection/:subsubsection" component={loadable(() => import('./components/Routes/Group'))} />
                        <Route path="/group/:handle/:section/:subsection" component={loadable(() => import('./components/Routes/Group'))} />
                        <Route path="/group/:handle/:section" component={loadable(() => import('./components/Routes/Group'))} />
                        <Route path="/group/:handle" component={loadable(() => import('./components/Routes/Group'))} />
                        <Route path="/group-people/:handle/:which" component={loadable(() => import('./components/Routes/GroupPeople'))} />
                        <Route path="/" component={loadable(() => import('./components/Routes/Home'))} />
                    </Switch>
                </div>
                {/* <SideInfo /> */}
                <ModalRoutes />
            </Router>
        </div>
    );
}

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const numberOfSlashes = pathname.split("/").length - 1;
        if (numberOfSlashes < 3) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
