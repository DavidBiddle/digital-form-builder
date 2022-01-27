import React from "react";
import ReactDOM from "react-dom";
import { LandingChoice, NewConfig, ChooseExisting } from "./pages/LandingPage";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import Designer from "./designer";
import { SaveError } from "./pages/ErrorPages";
import { CookiesProvider, useCookies } from "react-cookie";
import { ProgressPlugin } from "webpack";

initI18n();

function NoMatch() {
  return <div>404 Not found</div>;
}

function UserChoice() {
  let [cookies, setcookie] = useCookies(["user"]);
  let [userState, updateUserState] = React.useState(cookies.user);

  let updateUser = (e: React.FormEvent<HTMLFormElement>) => {
    setcookie("user", userState, {
      path: "/",
      sameSite: "strict",
    });

    return true;
  };

  // return (
  //   <form onSubmit={(e) => updateUser(e)}>
  //     <label htmlFor="user-picker">User select: </label>
  //     <input
  //       id="user-picker"
  //       name="user-picker"
  //       type="text"
  //       onChange={(e) => updateUserState(e.target.value)}
  //       value={userState}
  //     />
  //     <button type="submit">Submit</button>
  //   </form>
  // );
  return <div>Logged in as: {cookies.user}</div>;
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function AuthProvider({ children }) {
  let [cookies] = useCookies(["user"]);
  if (cookies.user) return children;
  window.location.href = "/api/login";
}

function Auth() {
  let [_, setcookie] = useCookies(["user"]);
  let query = useQuery();

  setcookie("user", query.get("token"), {
    path: "/",
    sameSite: "strict",
  });
  return <Redirect to="/" />;
}

export class App extends React.Component {
  render() {
    return (
      <Router basename="/app">
        <CookiesProvider>
          <div id="app">
            <UserChoice />
            <Switch>
              <Route path="/auth" exact>
                <Auth />
              </Route>
              <AuthProvider>
                <Route path="/designer/:id" component={Designer} />
                <Route path="/" exact>
                  <LandingChoice />
                </Route>
                <Route path="/new" exact>
                  <NewConfig />
                </Route>
                <Route path="/choose-existing" exact>
                  <ChooseExisting />
                </Route>
                <Route path="/save-error" exact>
                  <SaveError />
                </Route>
                <Route path="*">
                  <NoMatch />
                </Route>
              </AuthProvider>
            </Switch>
          </div>
        </CookiesProvider>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
