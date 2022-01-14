import React from "react";
import ReactDOM from "react-dom";
import { LandingChoice, NewConfig, ChooseExisting } from "./pages/LandingPage";
import "./styles/index.scss";
import { initI18n } from "./i18n";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Designer from "./designer";
import { SaveError } from "./pages/ErrorPages";
import { CookiesProvider, useCookies } from "react-cookie";

initI18n();

function NoMatch() {
  return <div>404 Not found</div>;
}

function UserChoice() {
  let [userState, updateUserState] = React.useState("user");
  let [_, setcookie] = useCookies(["user"]);

  let updateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setcookie("user", userState, {
      path: "/",
      sameSite: "strict",
    });
  };

  return (
    <form onSubmit={(e) => updateUser(e)}>
      <input
        type="text"
        onChange={(e) => updateUserState(e.target.value)}
        value={userState}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export class App extends React.Component {
  render() {
    return (
      <Router basename="/app">
        <CookiesProvider>
          <div id="app">
            <UserChoice />
            <Switch>
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
            </Switch>
          </div>
        </CookiesProvider>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
