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
                        <Route path="/poll/:voteName/:groupHandle/:section/:subsection/:subsubsection" component={loadable(() => import('@components/routes/Question'))} />
                        <Route path="/poll/:voteName/:groupHandle/:section/:subsection" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/poll/:voteName/:groupHandle/:section" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/poll/:voteName/:groupHandle" component={loadable(() => import('./components/routes/Question'))} />
                        
                        <Route path="/multipoll/:voteName/:groupHandle/:section/:subsection/:subsubsection" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupHandle/:section/:subsection" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupHandle/:section" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/multipoll/:voteName/:groupHandle" component={loadable(() => import('./components/routes/Question'))} />
                        <Route path="/grouping/:groupType/:groupFilter" component={loadable(() => import('./components/routes/Grouping'))} />
                        <Route path="/register" component={loadable(() => import('./components/routes/CreateProfile'))} />
                        <Route path="/create-vote" component={loadable(() => import('./components/routes/CreateVote'))} />
                        <Route path="/create-vote/:groupName" component={loadable(() => import('./components/routes/CreateVote'))} />
                        {/* <Route path="/create-sub-vote/:voteName" component={loadable(() => import('./components/routes/CreateVote'))} /> */}
                        <Route path="/profile/:handle/:section/:subsection/:subsubsection" component={loadable(() => import('./components/routes/Profile'))} />
                        <Route path="/profile/:handle/:section/:subsection" component={loadable(() => import('./components/routes/Profile'))} />
                        <Route path="/profile/:handle/:section" component={loadable(() => import('./components/routes/Profile'))} />
                        <Route path="/profile/:handle" component={loadable(() => import('./components/routes/Profile'))} />
                        <Route path="/profile" component={loadable(() => import('./components/routes/Profile'))} />
                        <Route path="/profile-people/:handle/:which" component={loadable(() => import('./components/routes/ProfilePeople'))} />
                        <Route path="/trending" component={loadable(() => import('./components/routes/Trending'))} />
                        <Route path="/feed" component={loadable(() => import('./components/routes/Feed'))} />
                        <Route path="/groups" component={loadable(() => import('./components/routes/Groups'))} />
                        <Route path="/group/:handle/:section/:subsection/:subsubsection" component={loadable(() => import('./components/routes/Group'))} />
                        <Route path="/group/:handle/:section/:subsection" component={loadable(() => import('./components/routes/Group'))} />
                        <Route path="/group/:handle/:section" component={loadable(() => import('./components/routes/Group'))} />
                        <Route path="/group/:handle" component={loadable(() => import('./components/routes/Group'))} />
                        <Route path="/group-people/:handle/:which" component={loadable(() => import('./components/routes/GroupPeople'))} />
                        <Route path="/" component={loadable(() => import('./components/routes/Home'))} />
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
